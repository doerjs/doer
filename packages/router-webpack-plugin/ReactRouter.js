import path from 'node:path'
import url from 'node:url'
import * as file from '@doerjs/utils/file.js'
import * as shell from '@doerjs/utils/shell.js'

import Router from './Router.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const templates = [
  'bootstrap.ejs',
  'Error.ejs',
  'Suspense.ejs',
  'history.ejs',
  'Debug.ejs',
  'Debug.module.ejs',
  'dynamicLayout.ejs',
  'Layout.ejs',
  'Root.ejs',
  'NotFound.ejs',
  'dynamicPage.ejs',
  'Router.ejs',
  'loaderComponent.ejs',
].reduce((result, template) => {
  result[template] = file.readFile(path.resolve(__dirname, `./templates-react/${template}`))
  return result
}, {})

class ReactRouter extends Router {
  writeLoaderComponent() {
    this.writeTemplate('loaderComponent.js', templates['loaderComponent.ejs'])
  }

  writeError() {
    const errorFileName = 'Error.jsx'

    const errorFilePath = path.resolve(this.options.outputPath, errorFileName)
    const { error = {} } = this.options.appConfig
    const errorData = { error: {} }
    errorData.error.page = error.page ? this.relativePath(errorFilePath, error.page) : ''
    errorData.error.layout = error.layout ? this.relativePath(errorFilePath, error.layout) : ''

    this.writeTemplate(errorFileName, templates['Error.ejs'], errorData)
  }

  writeSuspense() {
    const suspenseFileName = 'Suspense.jsx'

    const suspenseFilePath = path.resolve(this.options.outputPath, suspenseFileName)
    const { loading = {} } = this.options.appConfig
    const loadingData = { loading: {} }
    loadingData.loading.page = loading.page ? this.relativePath(suspenseFilePath, loading.page) : ''
    loadingData.loading.layout = loading.layout ? this.relativePath(suspenseFilePath, loading.layout) : ''

    this.writeTemplate(suspenseFileName, templates['Suspense.ejs'], loadingData)
  }

  writeBootstrap() {
    this.writeTemplate('bootstrap.js', templates['bootstrap.ejs'])
  }

  writeHistory() {
    this.writeTemplate('history.js', templates['history.ejs'], {
      browserHistory: this.options.appConfig.browserHistory,
    })
  }

  writeDebug() {
    this.writeTemplate('Debug.jsx', templates['Debug.ejs'], {
      appName: this.options.appPackage.name,
    })
    this.writeTemplate('Debug.module.css', templates['Debug.module.ejs'])
  }

  writeLayout(layout) {
    const relativeRawLayoutFilePath = this.relativePath(layout.dynamicLayoutFilePath, layout.rawLayoutFilePath)
    this.writeTemplate(layout.dynamicLayoutFilePath, templates['dynamicLayout.ejs'], {
      ...layout,
      relativeRawLayoutFilePath,
    })
  }

  writeLayouts() {
    shell.execSync(`mkdir ${this.options.outputPath}/layouts`)
    this.layouts.forEach((layout) => {
      this.writeLayout(layout)
    })
  }

  writeLayoutContainer() {
    const layouts = this.layouts.filter((layout) => !layout.isEmpty)
    this.writeTemplate('Layout.jsx', templates['Layout.ejs'], { layouts })
  }

  writePages() {
    shell.execSync(`mkdir ${this.options.outputPath}/pages`)
    this.writeTemplate('pages/NotFound.jsx', templates['NotFound.ejs'])
    this.pages.forEach((page) => {
      this.writePage(page)
    })
  }

  writePage(page) {
    const relativeRawPageFilePath = this.relativePath(page.dynamicPageFilePath, page.rawPageFilePath)
    this.writeTemplate(page.dynamicPageFilePath, templates['dynamicPage.ejs'], {
      ...page,
      relativeRawPageFilePath,
    })
  }

  writeApp() {
    this.writeTemplate('Root.jsx', templates['Root.ejs'], {
      browserHistory: this.options.appConfig.browserHistory,
    })
  }

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
    this.writeTemplate('Router.jsx', templates['Router.ejs'], routerData)
  }

  // 继承重写启动
  bootstrap() {
    super.bootstrap()

    this.writeLoaderComponent()
    this.writeError()
    this.writeSuspense()
    this.writeBootstrap()
    this.writeHistory()
    this.writeDebug()
    this.writeLayouts()
    this.writeLayoutContainer()
    this.writePages()
    this.writeApp()
    this.writeRouter()
  }

  // 继承重写创建页面文件
  createPage(filePath) {
    const page = this.parsePage(filePath)
    this.pages.push(page)
    this.writePage(page)

    if (!page.isEmpty) {
      this.writeRouter()
    }
  }

  // 继承重写创建布局文件
  createLayout(filePath) {
    const layout = this.parseLayout(filePath)
    this.layouts.push(layout)
    this.writeLayout(layout)

    if (!layout.isEmpty) {
      this.writeLayoutContainer()
    }
  }

  // 继承重写删除页面文件
  removePage(filePath) {
    const page = this.parsePage(filePath)
    this.pages = this.pages.filter((item) => item.pageName !== page.pageName)
    this.writeRouter()
    this.removeFile(page.dynamicPageFilePath)
  }

  // 继承重写删除布局文件
  removeLayout(filePath) {
    const layout = this.parseLayout(filePath)
    this.layouts = this.layouts.filter((item) => item.layoutName !== layout.layoutName)
    this.writeLayoutContainer()
    this.removeFile(layout.dynamicLayoutFilePath)
  }

  // 继承重写变更页面文件
  changePage(filePath) {
    const page = this.parsePage(filePath)
    let prePage
    this.pages = this.pages.map((item) => {
      if (item.pageName === page.pageName) {
        prePage = item
        return page
      }
      return item
    })

    // 页面由空转为非空或者由非空转为空
    if (prePage && prePage.isEmpty !== page.isEmpty) {
      this.writeRouter()
    }
  }

  // 继承重写变更布局文件
  changeLayout(filePath) {
    const layout = this.parseLayout(filePath)
    let preLayout
    this.layouts = this.layouts.map((item) => {
      if (item.layoutName === layout.layoutName) {
        preLayout = item
        return layout
      }
      return item
    })

    // 布局由空转为非空或者由非空转为空
    if (preLayout.isEmpty !== layout.isEmpty) {
      this.writeLayoutContainer()
    }
  }
}

export default ReactRouter
