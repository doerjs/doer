'use strict'

const file = require('@doerjs/utils/file')
const is = require('@doerjs/utils/is')
const logger = require('@doerjs/utils/logger')

const paths = require('./Paths')

const defaultConfig = {
  // 项目模式 project项目 library组件库
  mode: 'project',
  // mode为library时，作为库名的前缀
  libraryName: '',
  // 项目别名
  alias: {},
  // 配置额外的node_modules编译包，部分第三方包没有提供编译后的版本，需要自行配置编译
  extraBabelCompileNodeModules: [],
  // 配置项目导出资源
  exposes: {},
  // 配置项目需要共享的库
  shared: {},
  // 配置项目的页面及布局loading组件
  loading: {},
  // 配置项目的页面及布局加载失败时的error组件
  error: {},
  // 配置相关插件
  plugins: [],
  // 是否开启browserHistory
  browserHistory: false,
}

// 创建简单类型配置获取函数
function createConfigFactory(rawConfig) {
  return function (name, check) {
    const value = rawConfig[name]

    if (is.isUndefined(value)) {
      return defaultConfig[name]
    }

    if (!check(value)) {
      logger.fail(`无效的配置项[ ${name} ]，请检查.doerrc.js文件中的配置`)
      process.exit(-1)
    }

    return value
  }
}

// 解析loading配置，最终分别输出page和layout的对应loading组件路径
function getLoading(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.loading)) {
    return defaultConfig.loading
  }

  const config = option.config

  if (is.isString(rawConfig.loading)) {
    const loadingFilePath = paths.resolvePath(rawConfig.loading, config.alias)
    return {
      page: loadingFilePath,
      layout: loadingFilePath,
    }
  }

  if (is.isObject(rawConfig.loading)) {
    return {
      page: is.isString(rawConfig.loading.page) ? paths.resolvePath(rawConfig.loading.page, config.alias) : undefined,
      layout: is.isString(rawConfig.loading.layout)
        ? paths.resolvePath(rawConfig.loading.layout, config.alias)
        : undefined,
    }
  }

  logger.fail(`无效的配置项[ loading ]，请检查.doerrc.js文件中的配置`)
  process.exit(-1)
}

// 解析error配置，最终分别输出page和layout的对应error组件路径
function getError(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.error)) {
    return defaultConfig.error
  }

  const config = option.config

  if (is.isString(rawConfig.error)) {
    const errorFilePath = paths.resolvePath(rawConfig.error, config.alias)
    return {
      page: errorFilePath,
      layout: errorFilePath,
    }
  }

  if (is.isObject(rawConfig.error)) {
    return {
      page: is.isString(rawConfig.error.page) ? paths.resolvePath(rawConfig.error.page, config.alias) : undefined,
      layout: is.isString(rawConfig.error.layout) ? paths.resolvePath(rawConfig.error.layout, config.alias) : undefined,
    }
  }

  logger.fail(`无效的配置项[ error ]，请检查.doerrc.js文件中的配置`)
  process.exit(-1)
}

/**
 * 获取插件的配置信息和插件路径
 * 1. 支持简单字符串路径配置如：@doerjs/plugin-less
 * 2. 支持复杂的带配置信息的配置如：['@doerjs/plugin-less', {}]
 */
function getPlugins(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.plugins)) {
    return defaultConfig.plugins
  }

  const config = option.config
  const plugins = rawConfig.plugins
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
        path: paths.resolvePath(pluginPath, config.alias),
        option: pluginOption,
      }
    })
    .filter(Boolean)

  return plugins
}

class Config {
  // 单例实例
  static instance = null

  // 原始配置信息，通过简单解析配置文件得来
  rawConfig = {}

  // 解析并校验后的准确配置信息，可以放心使用的配置
  config = {}

  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config()
    }
    return Config.instance
  }

  _parseRawConfig() {
    const hasConfigFile = file.isExist(paths.configPath)
    if (!hasConfigFile) {
      this.config = defaultConfig
      return
    }

    this.rawConfig = require(paths.configPath)
  }

  _parseConfig() {
    const getConfigValue = createConfigFactory(this.rawConfig)

    this.config.mode = getConfigValue('mode', is.isEnum(['project', 'library']))
    this.config.libraryName = getConfigValue('libraryName', is.isString)
    this.config.alias = getConfigValue('alias', is.isObject)
    this.config.extraBabelCompileNodeModules = getConfigValue('extraBabelCompileNodeModules', is.isArray)
    this.config.exposes = getConfigValue('exposes', is.isObject)
    this.config.shared = getConfigValue('shared', is.isObject)
    this.config.browserHistory = getConfigValue('browserHistory', is.isBoolean)

    this.config.loading = getLoading(this)
    this.config.error = getError(this)

    this.config.plugins = getPlugins(this)
  }

  /**
   * 解析配置文件
   */
  parse() {
    this._parseRawConfig()
    this._parseConfig()
  }
}

module.exports = Config.getInstance()
