'use strict'

const path = require('path')
const ejs = require('ejs')

const file = require('../utils/file')
const shell = require('../utils/shell')
const util = require('../utils/util')

// index.js
const indexTemplate = `
import('bootstrap')
`

// bootstrap.js
const bootstrapTemplate = `
import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'

ReactDOM.render(
  <App />,
  document.getElementById('root'),
)
`

// app.jsx
const appTemplate = `
import React, { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'

import Layout from './layout'
import Router from './router'

export default function App() {
  return (
    <Suspense>
      <HashRouter>
        <Layout>
          <Suspense>
            <Router />
          </Suspense>
        </Layout>
      </HashRouter>
    </Suspense>
  )
}
`

// layout.jsx
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

// router.jsx
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
      <Route<% if (page.isIndex) { %> index<% } %> path="<%= page.routePath %>" element={<<%= page.pageName %> />} />
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

  const [suffix] = basename.match(pageRegex)
  const routeString = basename.replace(suffix, '')

  const routeParts = routeString.split('.').filter((item) => item)

  // 根据目录文件名解析路由地址
  const routePath = routeParts
    .map((name) => {
      if (name.startsWith('$')) {
        return `:${name.replace('$', '')}`
      }

      if (name.endsWith('$')) {
        return `*${name.replace('$', '')}`
      }

      return name
    })
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
    isIndex: basename === 'index',
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

/**
 * pageRootPath
 * layoutRootPath
 * outputPath
 */
class TravelerWebpackPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('initialize', (params, callback) => {
      shell.execSync(`rm -rf ${this.options.outputPath}`)
      shell.execSync(`mkdir ${this.options.outputPath}`)

      this.write('index.js', indexTemplate)
      this.write('bootstrap.js', bootstrapTemplate)
      this.write('app.jsx', appTemplate)
      this.write('layout.jsx', layoutTemplate)

      this.createRouter()
    })
  }

  // 初始化项目路由
  createRouter() {
    shell.execSync(`mkdir ${this.options.outputPath}/pages`)

    this.write('pages/NotFound.jsx', notFoundTemplate)

    const pages = readPages(this.options)
    // 输出页面的动态引入文件
    pages.forEach((page) => {
      // 获取相对路径并格式化为webpack识别的路径
      const relativeRawPageFilePath = util.formatToPosixPath(
        path.relative(page.rawPageFilePath, page.dynamicPageFilePath),
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
    this.write('router.jsx', routerTemplate, routerData)
  }

  write(fileName, content, data = {}) {
    const code = ejs.render(content, data)
    file.writeFileContent(path.resolve(this.options.outputPath, fileName), code)
  }
}

module.exports = TravelerWebpackPlugin
