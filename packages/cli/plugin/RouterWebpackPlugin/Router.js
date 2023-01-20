'use strict'

const path = require('node:path')
const ejs = require('ejs')
const file = require('@doerjs/utils/file')
const shell = require('@doerjs/utils/shell')
const tool = require('@doerjs/utils/tool')
const babelParser = require('@babel/parser')

const ast = require('./ast')

// 读取模版内容
const templates = ['app.ejs', 'publicPath.ejs', 'loader.ejs', 'helper.ejs', 'index.ejs'].reduce((result, template) => {
  result[template] = file.readFileContent(path.resolve(__dirname, `./templates/${template}`))
  return result
}, {})

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
          return tool.firstCharToUpperCase(name.replace('$', ''))
        }

        return tool.firstCharToUpperCase(name)
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

  const layoutName = 'L' + tool.firstCharToUpperCase(basename)
  return {
    layoutName,
    isEmpty: file.isEmptyFile(layoutFile),
    dynamicLayoutFilePath: path.resolve(options.outputPath, `layouts/${layoutName}.js`),
    rawLayoutFilePath: layoutFile,
  }
}

class Router {
  constructor(options) {
    this.options = options
    // 存储页面
    this.pages = []
    // 存储布局
    this.layouts = []
  }

  // 检测是否是页面
  isPage(filePath) {
    const basename = path.basename(filePath)
    const pageRegex = new RegExp(`.page.(${this.options.extensions.map((ext) => ext.slice(1)).join('|')})`)
    return pageRegex.test(basename)
  }

  // 检测是否是布局
  isLayout(filePath) {
    const basename = path.basename(filePath)
    const layoutRegex = new RegExp(`.layout.(${this.options.extensions.map((ext) => ext.slice(1)).join('|')})`)
    return layoutRegex.test(basename)
  }

  // 检测是否是app.js
  isAppEntry(filePath) {
    const globalScriptPath = path.resolve(this.options.srcPath, 'app')
    return this.options.extensions.some((ext) => {
      return filePath === globalScriptPath + ext
    })
  }

  // 获取相对文件路径的webpack导入路径
  relativePath(basePath, filePath) {
    return tool.formatToPosixPath(path.relative(path.dirname(basePath), filePath))
  }

  // 解析页面
  parsePage(filePath) {
    return resolvePage(filePath, this.options)
  }

  // 解析布局
  parseLayout(filePath) {
    return resolveLayout(filePath, this.options)
  }

  // 文件路径解析
  parseFile(filePath) {
    if (this.isPage(filePath)) {
      this.pages.push(this.parsePage(filePath))
    }

    if (this.isLayout(filePath)) {
      this.layouts.push(this.parseLayout(filePath))
    }
  }

  getAppEntryPath() {
    const appEntryPath = path.resolve(this.options.srcPath, 'app')
    let ext = this.options.extensions.find((ext) => {
      return file.isExist(appEntryPath + ext)
    })
    if (!ext) {
      ext = '.js'
    }
    return appEntryPath + ext
  }

  // 物理删除文件
  removeFile(filePath) {
    shell.execSync(`rm ${filePath}`)
  }

  writeAppEntry() {
    const appFileName = 'app.js'

    const appEntryPath = this.getAppEntryPath()

    const isExist = file.isExist(appEntryPath)
    const appData = {
      relativeAppEntryPath: isExist
        ? this.relativePath(path.resolve(this.options.outputPath, appFileName), appEntryPath)
        : '',
      exports: {},
    }

    if (isExist) {
      // 解析文件内容，收集用户自定义的勾子函数
      const code = file.readFileContent(appEntryPath)
      const astTree = babelParser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })
      appData.exports = ast.parseExports(astTree)
    }
    this.writeTemplate(appFileName, templates['app.ejs'], appData)
  }

  writePublicPath() {
    this.writeTemplate('publicPath.js', templates['publicPath.ejs'], { publicPath: this.options.publicPath })
  }

  writeLoader() {
    this.writeTemplate('loader.js', templates['loader.ejs'], {
      remoteFileName: this.options.remoteFileName,
    })
  }

  writeHelper() {
    this.writeTemplate('helper.js', templates['helper.ejs'], {
      browserHistory: this.options.appConfig.browserHistory,
    })
  }

  writeIndex() {
    this.writeTemplate('index.js', templates['index.ejs'], {
      appName: this.options.appPackage.name,
    })
  }

  // 初始化，用于做初始化任务，比如渲染对应的框架模版文件
  initialize() {
    shell.execSync(`rm -rf ${this.options.outputPath}`)
    shell.execSync(`mkdir ${this.options.outputPath}`)
    file.eachFile(this.options.srcPath, (filePath) => this.parseFile(filePath))
    this.bootstrap()
  }

  // 启动
  bootstrap() {
    this.writeIndex()
    this.writeAppEntry()
    this.writePublicPath()
    this.writeLoader()
    this.writeHelper()
  }

  writeTemplate(fileName, content, data = {}) {
    const code = ejs.render(content, data)
    const filePath = path.resolve(this.options.outputPath, fileName)
    file.writeFileContent(filePath, code)
  }

  createPage(filePath) {
    const page = this.parsePage(filePath)
    this.pages.push(page)
  }

  createLayout(filePath) {
    const layout = this.parseLayout(filePath)
    this.layouts.push(layout)
  }

  // 文件监听添加
  create(filePath) {
    if (this.isPage(filePath)) {
      this.createPage(filePath)
    }

    if (this.isLayout(filePath)) {
      this.createLayout(filePath)
    }

    if (this.isAppEntry(filePath)) {
      this.writeAppEntry()
    }
  }

  removePage(filePath) {
    const page = this.parsePage(filePath)
    this.pages = this.pages.filter((item) => item.pageName !== page.pageName)
  }

  removeLayout(filePath) {
    const layout = this.parseLayout(filePath)
    this.layouts = this.layouts.filter((item) => item.layoutName !== layout.layoutName)
  }

  // 文件监听删除
  remove(filePath) {
    if (this.isPage(filePath)) {
      this.removePage(filePath)
    }

    if (this.isLayout(filePath)) {
      this.removeLayout(filePath)
    }

    if (this.isAppEntry(filePath)) {
      this.writeAppEntry()
    }
  }

  changePage(filePath) {
    const page = this.parsePage(filePath)
    this.pages = this.pages.map((item) => {
      if (item.pageName === page.pageName) {
        return page
      }
      return item
    })
  }

  changeLayout(filePath) {
    const layout = this.parseLayout(filePath)
    this.layouts = this.layouts.map((item) => {
      if (item.layoutName === layout.layoutName) {
        return layout
      }
      return item
    })
  }

  // 文件监听改变
  change(filePath) {
    if (this.isPage(filePath)) {
      this.changePage(filePath)
    }

    if (this.isLayout(filePath)) {
      this.changeLayout(filePath)
    }

    if (this.isAppEntry(filePath)) {
      this.writeAppEntry()
    }
  }
}

module.exports = Router
