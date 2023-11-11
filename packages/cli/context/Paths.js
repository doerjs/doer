'use strict'

const path = require('node:path')
const file = require('@doerjs/utils/file')

const runtimePath = process.cwd()
const rootPath = path.resolve(__dirname, '../')
const srcPath = path.resolve(runtimePath, 'src')
const publicDirectory = path.resolve(runtimePath, './public')
const tempComplierName = process.env.NODE_ENV === 'production' ? '.doer.prod' : '.doer'
const tempComplierPath = path.resolve(srcPath, tempComplierName)

class Paths {
  // 单例实例
  static instance = null

  static getInstance() {
    if (!Paths.instance) {
      Paths.instance = new Paths()
    }
    return Paths.instance
  }

  // 运行时路径
  runtimePath = runtimePath

  // 根路径
  rootPath = rootPath

  // 脚手架包配置文件路径
  packageJsonPath = path.resolve(rootPath, 'package.json')

  // 脚手架node_modules路径
  nodeModulesPath = path.resolve(rootPath, 'node_modules')

  // JS模版文件路径
  templatePath = path.resolve(rootPath, 'template')

  // TS模版文件路径
  typescriptTemplatePath = path.resolve(rootPath, 'template-typescript')

  // env环境配置文件路径
  env = path.resolve(runtimePath, './.env')

  // 脚手架应用配置文件路径
  configPath = path.resolve(runtimePath, '.doerrc.js')

  // 应用源码路径地址
  srcPath = srcPath

  // 应用打包路径地址
  buildPath = path.resolve(runtimePath, 'dist')

  // 应用包配置文件路径
  appPackageJsonPath = path.resolve(runtimePath, 'package.json')

  // 公共资源路径地址
  publicDirectory = publicDirectory

  // 应用node_modules路径
  appNodeModulesPath = path.resolve(runtimePath, 'node_modules')

  // 应用入口html路径
  htmlPath = path.resolve(publicDirectory, 'index.html')

  // 应用入口文件路径
  entryPath = path.resolve(tempComplierPath, 'index.js')

  // 应用临时编译路径
  tempComplierPath = tempComplierPath

  // 应用编译上下文
  contextPaths = [srcPath]

  /**
   * 解析别名的相对路径
   * @param {String} filePath 路径地址
   * @param {Object} alias 别名配置信息
   * @return {String} 相对路径信息
   */
  resolveAliasRelativePath(filePath, alias) {
    const aliasName = Object.keys(alias).find((name) => {
      return filePath.startsWith(name + '/')
    })

    if (aliasName) {
      return filePath.replace(aliasName, alias[aliasName])
    }

    return filePath
  }

  /**
   * 解析真实存在的文件路径，会在内置的几个路径中查找
   * [this.runtimePath, this.appNodeModulesPath, this.nodeModulesPath]
   * @param {String} filePath 路径地址
   * @param {Object} alias 别名配置信息
   * @return {String} 真实存在的文件路径
   */
  resolvePath(filePath, alias) {
    if (path.isAbsolute(filePath)) {
      return filePath
    }

    const relativeFilePath = this.resolveAliasRelativePath(filePath, alias)

    const modules = [this.runtimePath, this.appNodeModulesPath, this.nodeModulesPath]

    let moduleFilePath
    modules.some((modulePath) => {
      moduleFilePath = path.resolve(modulePath, relativeFilePath)
      if (file.isExist(moduleFilePath)) {
        return true
      }

      return false
    })

    return moduleFilePath
  }

  /**
   * 返回远程公共资源路径，development环境下返回本地开发地址路径
   * @returns {String} 远程公共资源路径
   */
  getRemotePublicUrlPath() {
    if (process.env.NODE_ENV === 'development') {
      const isHttps = process.env.HTTPS === 'true'
      const host = process.env.HOST
      const port = process.env.PORT

      const protocol = isHttps ? 'https://' : 'http://'
      const localhost = host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host

      return `${protocol}${localhost}:${port}${process.env.PUBLIC_URL}`
    }

    return process.env.PUBLIC_URL
  }
}

module.exports = Paths.getInstance()
