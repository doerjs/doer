import path from 'node:path'
import * as file from '@doerjs/utils/file.js'
import * as is from '@doerjs/utils/is.js'
import trace from '@doerjs/utils/trace.js'

import Parser from './Parser.js'

function createGetValue(config) {
  return function (name, check, defaultValue) {
    const value = config[name]

    if (is.isUndefined(value)) {
      return defaultValue
    }

    if (!check(value)) {
      trace.error(`[${name}] 无效的配置项，请检查配置文件`)
      process.exit(-1)
    }

    return value
  }
}

function replaceAliasPath(filePath, alias) {
  const aliasName = Object.keys(alias).find((name) => {
    return filePath.startsWith(name + '/')
  })

  if (aliasName) {
    return filePath.replace(aliasName, alias[aliasName])
  }

  return filePath
}

class Config extends Parser {
  path = null

  // 项目模式 project项目 library组件库
  mode = 'project'

  // mode为library时，作为库名的前缀
  // 当mode为library时，libraryName不能为空
  libraryName = ''

  // 项目别名
  alias = {}

  // 配置额外的node_modules编译包，部分第三方包没有提供编译后的版本，需要自行配置编译
  extraBabelCompileNodeModules = []

  // 配置项目导出资源
  exposes = {}

  // 配置项目需要共享的库
  shared = {}

  // 配置项目的页面及布局loading组件
  loading = {}

  // 配置插件
  plugins = []

  // 是否开启browserHistory
  browserHistory = false

  // webpack配置式勾子
  webpackConfigure = () => {}

  // webpack配置勾子
  webpackConfig = (config) => config

  constructor(pathInstance) {
    super()
    this.path = pathInstance
  }

  static instance = null

  static create(pathInstance) {
    if (!Config.instance) {
      Config.instance = new Config(pathInstance)
    }

    return Config.instance
  }

  get context() {
    return [this.path.runtime, this.path.nodeModules, this.path.cliNodeModules]
  }

  resolvePath(filePath) {
    if (!filePath) {
      return
    }

    const currentPath = replaceAliasPath(filePath, this.alias)
    if (path.isAbsolute(currentPath)) {
      return currentPath
    }

    const isNodeModulePackage = [this.path.nodeModules, this.path.cliNodeModules].some((modulePath) => {
      return file.isExist(path.resolve(modulePath, currentPath))
    })
    if (isNodeModulePackage) {
      return currentPath
    }

    return path.resolve(this.path.runtime, currentPath)
  }

  async parse() {
    if (!file.isExist(this.path.config)) {
      return
    }
    const config = await import(this.path.config).then((module) => module.default)

    const getValue = createGetValue(config)

    this.mode = getValue('mode', is.isEnum(['project', 'library']), this.mode)
    this.libraryName = getValue('libraryName', is.isString, this.libraryName)
    this.alias = getValue('alias', is.isObject, this.alias)
    this.extraBabelCompileNodeModules = getValue(
      'extraBabelCompileNodeModules',
      is.isArray,
      this.extraBabelCompileNodeModules,
    )
    this.exposes = getValue('exposes', is.isObject, this.exposes)
    this.shared = getValue('shared', is.isObject, this.shared)
    this.browserHistory = getValue('browserHistory', is.isBoolean, this.browserHistory)
    this.webpackConfigure = getValue('webpackConfigure', is.isFunction, this.webpackConfigure)
    this.webpackConfig = getValue('webpackConfig', is.isFunction, this.webpackConfig)

    this.parseLoading(config)
    this.parsePlugins(config)

    if (this.mode === 'library' && !this.libraryName) {
      trace.error(`[libraryName] 库项目缺少的配置项，请检查配置文件`)
      process.exit(-1)
    }
  }

  parseLoading(config) {
    if (is.isUndefined(config.loading)) {
      return
    }

    let pageLoading
    let layoutLoading
    if (is.isString(config.loading)) {
      pageLoading = config.loading
      layoutLoading = config.loading
    } else if (is.isObject(config.loading)) {
      pageLoading = config.loading.page
      layoutLoading = config.loading.layout
    } else {
      trace.error('[loading] 无效的配置项，请检查配置文件')
      process.exit(-1)
    }

    if (pageLoading) {
      this.loading.page = this.resolvePath(pageLoading)
    }

    if (layoutLoading) {
      this.loading.layout = this.resolvePath(layoutLoading)
    }
  }

  parsePlugins(config) {
    if (!is.isArray(config.plugins)) {
      return
    }

    this.plugins = config.plugins
      .map((plugin) => {
        let pluginPath
        let pluginOption
        if (is.isString(plugin)) {
          pluginPath = plugin
        } else if (is.isArray(plugin)) {
          pluginPath = plugin[0]
          pluginOption = plugin[1]
        }

        if (!pluginPath) {
          return null
        }

        return {
          path: this.resolvePath(pluginPath),
          option: pluginOption,
        }
      })
      .filter(Boolean)
  }
}

export default Config
