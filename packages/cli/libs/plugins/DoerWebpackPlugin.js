'use strict'

const path = require('path')
const ejs = require('ejs')
const chokidar = require('chokidar')

const file = require('../utils/file')
const shell = require('../utils/shell')
const util = require('../utils/util')

// index.js
const indexTemplate = `
import(/* webpackChunkName: "bootstrap" */'./bootstrap')
`

// bootstrap.js
const bootstrapTemplate = `
import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
`

// hook.js
const hookTemplate = `
import { useRef, useCallback, useEffect, useMemo } from 'react'

import { getLayoutName } from './helper'

export function useGlobalEvent(eventName, eventHandler, options) {
  const handler = useRef(eventHandler)

  useEffect(() => {
    function callback(event) {
      if (typeof handler.current === 'function') {
        handler.current(event)
      }
    }

    if (eventName) {
      window.addEventListener(eventName, callback, options)
    }

    return () => {
      if (eventName) {
        window.removeEventListener(eventName, callback, options)
      }
    }
  }, [eventName, options])
}

export function useLayoutName() {
  return useMemo(() => {
    return getLayoutName()
  }, [window.location.hash])
}
`

// helper.js
const helperTemplate = `
export function getLayoutName() {
  const [layoutName = ''] = window.location.hash.replace('#', '').split('/').filter(item => item)
  return layoutName
}
`

// App.jsx
const appTemplate = `
import React, { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'

import { useLayoutName, useGlobalEvent } from './hook'
import { getLayoutName } from './helper'

import Layout from './Layout'
import Router from './Router'

<% if (loading.page) { %>
import PageLoading from '<%= loading.page %>'
<% } %>
<% if (loading.layout) { %>
import LayoutLoading from '<%= loading.layout %>'
<% } %>

export default function App() {
  const layoutName = useLayoutName()

  useGlobalEvent('hashchange', () => {
    const currLayoutName = getLayoutName()
    if (currLayoutName !== layoutName) {
      window.location.reload()
    }
  })

  return (
    <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
      <HashRouter basename={layoutName}>
        <Layout>
          <Suspense fallback={<% if (loading.page) { %><LayoutLoading /><% } else { %><div>loading</div><% } %>}>
            <Router />
          </Suspense>
        </Layout>
      </HashRouter>
    </Suspense>
  )
}
`

// Layout.jsx
const layoutTemplate = `
import React from 'react'

export default function Layout({ children }) {
  return children
}
`

// pages/NotFound.jsx
const notFoundTemplate = `
import React from 'react'

export default function NotFound() {
  return <div>404</div>
}
`

// Router.jsx
const routerTemplate = `
import React, { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
<% pages.forEach(function(page) { %>
import <%= page.pageName %> from './pages/<%= page.pageName %>'
<% }) %>
<% if (notFoundPage) { %>
import NotFound from './pages/<%= notFoundPage.pageName %>'
<% } else { %>
import NotFound from './pages/NotFound'
<% } %>

export default function Router() {
  return (
    <Routes>
      <% pages.forEach(function(page) { %>
      <Route path="<%= page.routePath %>" element={<<%= page.pageName %> />} />
      <% }) %>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
`

const dynamicPageTemplate = `
import { lazy } from 'react'

export default lazy(() => {
  return import(/* webpackChunkName: "page~<%= pageName %>" */'<%= relativeRawPageFilePath %>')
})
`

const pageRegex = /\.page\.(js|jsx)$/
// const layoutRegex = /\.layout\.(js|jsx)$/

/**
 * a.b.c.d.e -> a/b/c/d/e
 * a.$b.c.$d.e -> a/:b/c/:d/e
 * a.b.c.d.e$ -> a/b/c/d/*e
 *
 * {
 *  routePath: 'a/:b/c/:d/e', 路由地址
 *  pageName: '', 页面组件名称，以驼峰形式
 *  isEmpty: false, 文件是否为空
 *  dynamicPageFilePath: '', 页面文件生成的动态导入页面地址
 *  rawPageFilePath: '', 页面文件原始地址
 * }
 */
function resolvePage(pageFile, options) {
  const pagePath = path.dirname(pageFile)

  const basename = path.basename(pagePath)

  const [suffix] = basename.match(pageRegex) || []
  const routeString = basename.replace(suffix, '')

  const routeParts = routeString.split('.').filter((item) => item)

  // 根据目录文件名解析路由地址
  const routePath = routeParts
    .reduce((result, name, index) => {
      if (name.startsWith('$')) {
        result.push(`:${name.replace('$', '')}`)
      } else if (name.endsWith('$')) {
        result.push(`*${name.replace('$', '')}`)
      }

      // 最后一个名称为index时，省略
      if (index === routeParts.length - 1 && name === 'index') {
        return result
      }

      result.push(name)

      return result
    }, [])
    .join('/')

  const pageName =
    'P' +
    routeParts
      .map((name) => {
        if (name.startsWith('$') || name.endsWith('$')) {
          return util.firstCharToUpperCase(name.replace('$', ''))
        }

        return util.firstCharToUpperCase(name)
      })
      .join('')

  return {
    routePath,
    pageName,
    isEmpty: file.isEmptyFile(pageFile),
    dynamicPageFilePath: path.resolve(options.outputPath, `pages/${pageName}.js`),
    rawPageFilePath: pageFile,
  }
}

// 读取所有的页面
function readPages(options) {
  if (!file.isExist(options.pageRootPath) || !file.isDirectory(options.pageRootPath)) return []

  const readPageFiles = file.reduceReaddirFactory((result, filePath) => {
    if (file.isFile(filePath)) return result

    const files = file.readFiles(filePath, [])

    // 查找页面文件 eg: index.page.jsx
    const pageFile = files.find((item) => {
      const basename = path.basename(item)
      return pageRegex.test(basename)
    })

    if (pageFile) {
      result.push(pageFile)
    }

    return result
  })

  const pageFiles = readPageFiles(options.pageRootPath, [])

  return pageFiles.map((pageFile) => resolvePage(pageFile, options))
}

function isPageFile(file, options) {
  const dirname = path.dirname(path.dirname(file))
  const basename = path.basename(file)

  return dirname === options.pageRootPath && pageRegex.test(basename)
}

class DoerWebpackPlugin {
  /**
   * options
   *  appConfig 应用配置信息
   *  pageRootPath 页面根目录
   *  layoutRootPath 布局根目录
   *  outputPath 目标文件输出路径
   */
  constructor(options) {
    this.options = options
    this.pages = []
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('DoerWebpackPlugin', () => {
      shell.execSync(`rm -rf ${this.options.outputPath}`)
      shell.execSync(`mkdir ${this.options.outputPath}`)

      this.write('bootstrap.js', bootstrapTemplate)
      this.write('Layout.jsx', layoutTemplate)
      this.write('hook.js', hookTemplate)
      this.write('helper.js', helperTemplate)
      this.writeApp()
      this.writePages()
      this.writeRouter()
      this.write('index.js', indexTemplate)

      const watcher = chokidar.watch([this.options.pageRootPath], { ignoreInitial: true })

      watcher
        .on('change', this.onChange.bind(this))
        .on('add', this.onAdd.bind(this))
        .on('unlink', this.onRemove.bind(this))
        .on('error', this.onError.bind(this))
    })
  }

  writeApp() {
    const appFileName = 'App.jsx'

    // 获取注册的loading组件相对于app.jsx文件的路径
    const resolveLoadingPath = (loadingPath) => {
      if (!loadingPath) return ''
      return util.formatToPosixPath(
        path.relative(path.dirname(path.resolve(this.options.outputPath, appFileName)), loadingPath),
      )
    }

    const { loading = {} } = this.options.appConfig
    const appData = { loading: {} }
    appData.loading.page = resolveLoadingPath(loading.page)
    appData.loading.layout = resolveLoadingPath(loading.layout)

    this.write(appFileName, appTemplate, appData)
  }

  // 初始化项目路由
  writePages() {
    shell.execSync(`mkdir ${this.options.outputPath}/pages`)

    this.write('pages/NotFound.jsx', notFoundTemplate)

    this.pages = readPages(this.options)

    // 输出页面的动态引入文件
    this.pages.forEach((page) => {
      this.writePage(page)
    })
  }

  writePage(page) {
    // 获取相对路径并格式化为webpack识别的路径
    const relativeRawPageFilePath = util.formatToPosixPath(
      path.relative(path.dirname(page.dynamicPageFilePath), page.rawPageFilePath),
    )

    this.write(page.dynamicPageFilePath, dynamicPageTemplate, {
      ...page,
      relativeRawPageFilePath,
    })
  }

  // 写入路由文件
  writeRouter() {
    const routerData = this.pages.reduce(
      (result, page) => {
        if (page.isEmpty) {
          return result
        }

        if (page.pageName === 'P404') {
          result.notFoundPage = page
        } else {
          result.pages.push(page)
        }

        return result
      },
      { pages: [], notFoundPage: null },
    )
    // 写入路由注册文件
    this.write('Router.jsx', routerTemplate, routerData)
  }

  write(fileName, content, data = {}) {
    const code = ejs.render(content, data)
    const filePath = path.resolve(this.options.outputPath, fileName)

    file.writeFileContent(filePath, code)
  }

  remove(file) {
    shell.execSync(`rm ${file}`)
  }

  onChange(file) {
    // TODO 这里存在问题，当文件清空后重新写入文件时，会报错，需要再更新一下文件才行
    if (isPageFile(file, this.options)) {
      const page = resolvePage(file, this.options)

      const prePage = this.pages.find((item) => item.pageName === page.pageName)
      this.pages = this.pages.map((item) => {
        if (item.pageName === page.pageName) {
          return page
        }

        return item
      })

      if (prePage.isEmpty !== page.isEmpty) {
        this.writeRouter()
      }
    }
  }

  onAdd(file) {
    if (isPageFile(file, this.options)) {
      const page = resolvePage(file, this.options)

      this.pages.push(page)
      this.writePage(page)

      if (page.isEmpty) {
        return
      }

      this.writeRouter()
    }
  }

  onRemove(file) {
    if (isPageFile(file, this.options)) {
      const page = resolvePage(file, this.options)
      this.pages = this.pages.filter((item) => item.pageName !== page.pageName)
      this.writeRouter()
      this.remove(page.dynamicPageFilePath)
    }
  }

  onError() {}
}

module.exports = DoerWebpackPlugin
