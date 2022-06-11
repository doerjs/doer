'use strict'

const path = require('path')
const ejs = require('ejs')
const chokidar = require('chokidar')
const babelParser = require('@babel/parser')

const file = require('../utils/file')
const shell = require('../utils/shell')
const util = require('../utils/util')
const ast = require('../utils/ast')

const indexTemplate = require('../template/index.ejs')
const loaderTemplate = require('../template/loader.ejs')
const publicPathTemplate = require('../template/publicPath.ejs')
const bootstrapTemplate = require('../template/bootstrap.ejs')
const globalTemplate = require('../template/global.ejs')
const historyTemplate = require('../template/history.ejs')
const helperTemplate = require('../template/helper.ejs')
const appTemplate = require('../template/App.ejs')
const layoutTemplate = require('../template/Layout.ejs')
const dynamicLayoutTemplate = require('../template/dynamicLayout.ejs')
const dynamicPageTemplate = require('../template/dynamicPage.ejs')
const notFoundTemplate = require('../template/NotFound.ejs')
const routerTemplate = require('../template/Router.ejs')

const layoutRegex = /\.layout\.(js|jsx)$/
/**
 * {
 *  layoutName: '', 布局组件名称
 *  isEmpty: false, 文件是否为空
 *  dynamicLayoutFilePath: '', 布局文件生成的动态导入页面地址
 *  rawLayoutFilePath: '', 布局文件原始地址
 * }
 */
function resolveLayout(layoutFile, options) {
  const layoutPath = path.dirname(layoutFile)
  const basename = path.basename(layoutPath).toLocaleLowerCase()

  const layoutName = 'L' + util.firstCharToUpperCase(basename)
  return {
    layoutName,
    isEmpty: file.isEmptyFile(layoutFile),
    dynamicLayoutFilePath: path.resolve(options.outputPath, `layouts/${layoutName}.js`),
    rawLayoutFilePath: layoutFile,
  }
}

function isLayoutFile(file) {
  const basename = path.basename(file)
  return layoutRegex.test(basename)
}

const pageRegex = /\.page\.(js|jsx)$/
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
  const routeParts = basename
    .split('.')
    .filter((name) => name)
    .map((name) => name.toLocaleLowerCase())

  // 根据目录文件名解析路由地址
  const routePath = routeParts
    .reduce((result, name, index) => {
      if (name.startsWith('$')) {
        result.push(`:${name.replace('$', '')}`)
        return result
      } else if (name.endsWith('$')) {
        result.push(`*${name.replace('$', '')}`)
        return result
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

function isPageFile(file) {
  const basename = path.basename(file)
  return pageRegex.test(basename)
}

class DoerWebpackPlugin {
  /**
   * options
   *  appConfig 应用配置信息
   *  srcPath 源码目录
   *  outputPath 目标文件输出路径
   */
  constructor(options) {
    this.options = options

    this.globalScriptPath = path.resolve(this.options.srcPath, 'app.js')
    this.globalStylePath = path.resolve(this.options.srcPath, 'app.less')

    this.pages = []
    this.layouts = []
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('DoerWebpackPlugin', () => {
      shell.execSync(`rm -rf ${this.options.outputPath}`)
      shell.execSync(`mkdir ${this.options.outputPath}`)

      file.eachFile(this.options.srcPath, (filePath) => this.getFile(filePath))

      this.writeGlobal()
      this.writePublicPath()
      this.writeTemplate('loader.js', loaderTemplate, {
        remoteFileName: this.options.remoteFileName,
      })
      this.writeFile('bootstrap.js', bootstrapTemplate)
      this.writeFile('history.js', historyTemplate)
      this.writeFile('helper.js', helperTemplate)
      this.writeLayouts()
      this.writeLayoutContainer()
      this.writeApp()
      this.writePages()
      this.writeRouter()
      this.writeFile('index.js', indexTemplate)

      if (process.env.NODE_ENV === 'development') {
        const watcher = chokidar.watch(this.options.srcPath, {
          ignoreInitial: true,
        })

        watcher
          .on('change', this.onChange.bind(this))
          .on('add', this.onAdd.bind(this))
          .on('unlink', this.onRemove.bind(this))
          .on('error', this.onError.bind(this))
      }
    })
  }

  // 获取相对文件路径的webpack导入路径
  getRelativeWebpackPath(baseFilePath, filePath) {
    return util.formatToPosixPath(path.relative(path.dirname(baseFilePath), filePath))
  }

  getFile(filePath) {
    if (isPageFile(filePath)) {
      this.pages.push(resolvePage(filePath, this.options))
    } else if (isLayoutFile(filePath)) {
      this.layouts.push(resolveLayout(filePath, this.options))
    }
  }

  writeGlobal() {
    const globalFileName = 'global.js'

    const isExist = file.isExist(this.globalScriptPath)
    const globalData = {
      relativeGlobalScriptPath: isExist
        ? this.getRelativeWebpackPath(path.resolve(this.options.outputPath, globalFileName), this.globalScriptPath)
        : '',
      exports: {},
    }

    if (isExist) {
      // 解析文件内容，收集用户自定义的勾子函数
      const code = file.readFileContent(this.globalScriptPath)
      const astTree = babelParser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
      })
      globalData.exports = ast.parseExports(astTree)
    }
    this.writeTemplate(globalFileName, globalTemplate, globalData)
  }

  writePublicPath() {
    this.writeTemplate('publicPath.js', publicPathTemplate, { publicPath: this.options.publicPath })
  }

  writeApp() {
    const appFileName = 'App.jsx'

    const appFilePath = path.resolve(this.options.outputPath, appFileName)
    const { loading = {} } = this.options.appConfig
    const appData = { loading: {} }
    appData.loading.page = file.isExist(loading.page) ? this.getRelativeWebpackPath(appFilePath, loading.page) : ''
    appData.loading.layout = file.isExist(loading.layout)
      ? this.getRelativeWebpackPath(appFilePath, loading.layout)
      : ''

    appData.relativeGlobalStylePath = file.isExist(this.globalStylePath)
      ? this.getRelativeWebpackPath(appFilePath, this.globalStylePath)
      : ''

    this.writeTemplate(appFileName, appTemplate, appData)
  }

  writeLayouts() {
    shell.execSync(`mkdir ${this.options.outputPath}/layouts`)
    this.layouts.forEach((layout) => {
      this.writeLayout(layout)
    })
  }

  writeLayout(layout) {
    const relativeRawLayoutFilePath = this.getRelativeWebpackPath(
      layout.dynamicLayoutFilePath,
      layout.rawLayoutFilePath,
    )
    this.writeTemplate(layout.dynamicLayoutFilePath, dynamicLayoutTemplate, {
      ...layout,
      relativeRawLayoutFilePath,
    })
  }

  writeLayoutContainer() {
    const layouts = this.layouts.filter((layout) => !layout.isEmpty)
    this.writeTemplate('Layout.jsx', layoutTemplate, { layouts })
  }

  writePages() {
    shell.execSync(`mkdir ${this.options.outputPath}/pages`)
    this.writeTemplate('pages/NotFound.jsx', notFoundTemplate)
    this.pages.forEach((page) => {
      this.writePage(page)
    })
  }

  writePage(page) {
    const relativeRawPageFilePath = this.getRelativeWebpackPath(page.dynamicPageFilePath, page.rawPageFilePath)
    this.writeTemplate(page.dynamicPageFilePath, dynamicPageTemplate, {
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
    this.writeTemplate('Router.jsx', routerTemplate, routerData)
  }

  writeTemplate(fileName, content, data = {}) {
    const code = ejs.render(content, data)
    this.writeFile(fileName, code)
  }

  writeFile(fileName, content) {
    const filePath = path.resolve(this.options.outputPath, fileName)
    file.writeFileContent(filePath, content)
  }

  remove(file) {
    shell.execSync(`rm ${file}`)
  }

  /**
   * 页面文件改变时，检测文件是否存在空状态变化
   * 由空转为非空状态或者由非空转换成空状态时，这时候出现了注册页面路由的增减
   * 需要重新写人路由注入文件，告知webpack
   */
  changePage(file) {
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

  /**
   * 新增页面文件时，不管是否为空都需要生成动态导入入口
   * 如果页面不为空时，同时需要重写路由注入文件，告知webpack
   */
  addPage(file) {
    const page = resolvePage(file, this.options)

    this.pages.push(page)
    this.writePage(page)

    if (page.isEmpty) {
      return
    }

    this.writeRouter()
  }

  /**
   * 页面移除时需要移除动态导入文件，
   * 同时重写路由注入文件，告知webpack
   */
  removePage(file) {
    const page = resolvePage(file, this.options)
    this.pages = this.pages.filter((item) => item.pageName !== page.pageName)
    this.writeRouter()
    this.remove(page.dynamicPageFilePath)
  }

  /**
   * 布局文件改变时，检测文件是否存在空状态变化
   * 由空转为非空状态或者由非空转换成空状态时，这时候出现了注册布局的增减
   * 需要重新写人布局注入文件，告知webpack
   */
  changeLayout(file) {
    const layout = resolveLayout(file, this.options)

    const preLayout = this.layouts.find((item) => item.layoutName === layout.layoutName)
    this.layouts = this.layouts.map((item) => {
      if (item.layoutName === layout.layoutName) {
        return layout
      }

      return item
    })

    if (preLayout.isEmpty !== layout.isEmpty) {
      this.writeLayoutContainer()
    }
  }

  /**
   * 新增布局文件时，不管是否为空都需要生成动态导入入口
   * 如果布局不为空时，同时需要重写布局注入文件，告知webpack
   */
  addLayout(file) {
    const layout = resolveLayout(file, this.options)

    this.layouts.push(layout)
    this.writeLayout(layout)

    if (layout.isEmpty) {
      return
    }

    this.writeLayoutContainer()
  }

  /**
   * 布局移除时需要移除动态导入文件，
   * 同时重写布局注入文件，告知webpack
   */
  removeLayout(file) {
    const layout = resolveLayout(file, this.options)
    this.layouts = this.layouts.filter((item) => item.layoutName !== layout.layoutName)
    this.writeLayoutContainer()
    this.remove(layout.dynamicLayoutFilePath)
  }

  onChange(file) {
    // TODO 这里存在问题，当文件清空后重新写入文件时，会报错，需要再更新一下文件才行
    if (isPageFile(file)) {
      this.changePage(file)
    }

    if (isLayoutFile(file)) {
      this.changeLayout(file)
    }

    if (file === this.globalScriptPath) {
      this.writeGlobal()
    }
  }

  onAdd(file) {
    if (isPageFile(file)) {
      this.addPage(file)
    }

    if (isLayoutFile(file)) {
      this.addLayout(file)
    }

    if (file === this.globalStylePath) {
      this.writeApp()
    }

    if (file === this.globalScriptPath) {
      this.writeGlobal()
    }
  }

  onRemove(file) {
    if (isPageFile(file)) {
      this.removePage(file)
    }

    if (isLayoutFile(file)) {
      this.removeLayout(file)
    }

    if (file === this.globalStylePath) {
      this.writeApp()
    }

    if (file === this.globalScriptPath) {
      this.writeGlobal()
    }
  }

  onError() {}
}

module.exports = DoerWebpackPlugin
