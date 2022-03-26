'use strict'

const path = require('path')
const ejs = require('ejs')

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

// App.jsx
const appTemplate = `
import React, { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'

import Layout from './Layout'
import Router from './Router'

<% if (loading.page) { %>
import PageLoading from '<%= loading.page %>'
<% } %>
<% if (loading.layout) { %>
import LayoutLoading from '<%= loading.layout %>'
<% } %>

export default function App() {
  return (
    <Suspense fallback={<% if (loading.page) { %><PageLoading /><% } else { %><div>loading</div><% } %>}>
      <HashRouter>
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
 *  isIndex: false, 是否是根路由
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
    dynamicPageFilePath: path.resolve(options.outputPath, `pages/${pageName}.js`),
    rawPageFilePath: pageFile,
  }
}

// 读取所有的页面
function readPages(options) {
  if (!file.isExist(options.pageRootPath) || !file.isDirectory(options.pageRootPath)) return []

  const readPageFiles = file.reduceReaddirFactory((result, filePath) => {
    if (file.isFile(filePath)) return result

    const files = file.readFiles(filePath)

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

  const pageFiles = readPageFiles(options.pageRootPath)

  return pageFiles.map((pageFile) => resolvePage(pageFile, options))
}

class TravelerWebpackPlugin {
  /**
   * options
   *  appConfig 应用配置信息
   *  pageRootPath 页面根目录
   *  layoutRootPath 布局根目录
   *  outputPath 目标文件输出路径
   */
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('TravelerWebpackPlugin', () => {
      shell.execSync(`rm -rf ${this.options.outputPath}`)
      shell.execSync(`mkdir ${this.options.outputPath}`)

      this.write('bootstrap.js', bootstrapTemplate)
      this.write('Layout.jsx', layoutTemplate)
      this.writeApp()
      this.writeRouter()
      this.write('index.js', indexTemplate)
    })
  }

  writeApp() {
    const appFileName = 'App.jsx'

    // 获取注册的loading组件相对于app.jsx文件的路径
    const resolveLoadingPath = (loadingPath) => {
      if (!loadingPath) return ''
      return util.formatToPosixPath(path.resolve(this.options.outputPath, appFileName), loadingPath)
    }

    const { loading = {} } = this.options.appConfig
    const appData = { loading: {} }
    appData.loading.page = resolveLoadingPath(loading.page)
    appData.loading.layout = resolveLoadingPath(loading.layout)

    this.write(appFileName, appTemplate, appData)
  }

  // 初始化项目路由
  writeRouter() {
    shell.execSync(`mkdir ${this.options.outputPath}/pages`)

    this.write('pages/NotFound.jsx', notFoundTemplate)

    const pages = readPages(this.options)

    // 输出页面的动态引入文件
    pages.forEach((page) => {
      // 获取相对路径并格式化为webpack识别的路径
      const relativeRawPageFilePath = util.formatToPosixPath(
        path.relative(path.dirname(page.dynamicPageFilePath), page.rawPageFilePath),
      )

      this.write(page.dynamicPageFilePath, dynamicPageTemplate, {
        ...page,
        relativeRawPageFilePath,
      })
    })

    const routerData = pages.reduce(
      (result, page) => {
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
}

module.exports = TravelerWebpackPlugin
