'use strict'

const path = require('path')
const ejs = require('ejs')
const chokidar = require('chokidar')

const file = require('../utils/file')
const shell = require('../utils/shell')
const util = require('../utils/util')

const indexTemplate = require('../templates/index.ejs')
const bootstrapTemplate = require('../templates/bootstrap.ejs')
const hookTemplate = require('../templates/hook.ejs')
const helperTemplate = require('../templates/helper.ejs')
const appTemplate = require('../templates/App.ejs')
const layoutTemplate = require('../templates/Layout.ejs')
const dynamicLayoutTemplate = require('../templates/dynamicLayout.ejs')
const dynamicPageTemplate = require('../templates/dynamicPage.ejs')
const notFoundTemplate = require('../templates/NotFound.ejs')
const routerTemplate = require('../templates/Router.ejs')

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

// 读取所有的布局
function readLayouts(options) {
  if (!file.isExist(options.layoutRootPath) || !file.isDirectory(options.layoutRootPath)) return []

  const readLayoutFiles = file.reduceReaddirFactory((result, filePath) => {
    if (file.isFile(filePath)) return result

    const files = file.readFiles(filePath, [])

    // 查找布局文件 eg: full.layout.jsx
    const layoutFile = files.find((item) => {
      const basename = path.basename(item)
      return layoutRegex.test(basename)
    })

    if (layoutFile) {
      result.push(layoutFile)
    }

    return result
  })

  const layoutFiles = readLayoutFiles(options.layoutRootPath, [])

  return layoutFiles.map((layoutFile) => resolveLayout(layoutFile, options))
}

function isLayoutFile(file, options) {
  const dirname = path.dirname(path.dirname(file))
  const basename = path.basename(file)

  return dirname === options.layoutRootPath && layoutRegex.test(basename)
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
    this.layouts = []
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('DoerWebpackPlugin', () => {
      shell.execSync(`rm -rf ${this.options.outputPath}`)
      shell.execSync(`mkdir ${this.options.outputPath}`)

      this.write('bootstrap.js', bootstrapTemplate)
      this.write('hook.js', hookTemplate)
      this.write('helper.js', helperTemplate)
      this.writeLayouts()
      this.writeLayoutContainer()
      this.writeApp()
      this.writePages()
      this.writeRouter()
      this.write('index.js', indexTemplate)

      const watcher = chokidar.watch([this.options.pageRootPath, this.options.layoutRootPath], { ignoreInitial: true })

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

  // 初始化项目路由布局
  writeLayouts() {
    shell.execSync(`mkdir ${this.options.outputPath}/layouts`)

    this.layouts = readLayouts(this.options)

    // 输出布局的动态引入文件
    this.layouts.forEach((layout) => {
      this.writeLayout(layout)
    })
  }

  writeLayout(layout) {
    // 获取相对路径并格式化为webpack识别的路径
    const relativeRawLayoutFilePath = util.formatToPosixPath(
      path.relative(path.dirname(layout.dynamicLayoutFilePath), layout.rawLayoutFilePath),
    )

    this.write(layout.dynamicLayoutFilePath, dynamicLayoutTemplate, {
      ...layout,
      relativeRawLayoutFilePath,
    })
  }

  writeLayoutContainer() {
    const layouts = this.layouts.filter((layout) => !layout.isEmpty)
    this.write('Layout.jsx', layoutTemplate, { layouts })
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
    if (isPageFile(file, this.options)) {
      this.changePage(file)
    }

    if (isLayoutFile(file, this.options)) {
      this.changeLayout(file)
    }
  }

  onAdd(file) {
    if (isPageFile(file, this.options)) {
      this.addPage(file)
    }

    if (isLayoutFile(file, this.options)) {
      this.addLayout(file)
    }
  }

  onRemove(file) {
    if (isPageFile(file, this.options)) {
      this.removePage(file)
    }

    if (isLayoutFile(file, this.options)) {
      this.removeLayout(file)
    }
  }

  onError() {}
}

module.exports = DoerWebpackPlugin
