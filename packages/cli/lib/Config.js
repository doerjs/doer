'use strict'

const file = require('@doerjs/utils/file')
const is = require('@doerjs/utils/is')
const logger = require('@doerjs/utils/logger')

const defaultConfig = {
  alias: {},
  extraBabelCompileNodeModules: [],
  themes: {},
  exposes: {},
  shared: {},
  loading: {},
  error: {},
  plugins: [],
}

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

function getLoading(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.loading)) {
    return defaultConfig.loading
  }

  const config = option.config
  const paths = option.paths

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

function getError(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.error)) {
    return defaultConfig.error
  }

  const config = option.config
  const paths = option.paths

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

function getPlugins(option) {
  const rawConfig = option.rawConfig

  if (is.isUndefined(rawConfig.plugins)) {
    return defaultConfig.plugins
  }

  const config = option.config
  const paths = option.paths
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

function Config(option) {
  this.paths = option.paths

  this.rawConfig = {}
  this.config = {}
}

Config.prototype.parseFile = function () {
  const hasConfigFile = file.isExist(this.paths.appPaths.configPath)
  if (!hasConfigFile) {
    this.config = defaultConfig
    return
  }

  this.rawConfig = require(this.paths.appPaths.configPath)
}

Config.prototype.parseConfig = function () {
  const getConfigValue = createConfigFactory(this.rawConfig)

  this.config.alias = getConfigValue('alias', is.isObject)
  this.config.extraBabelCompileNodeModules = getConfigValue('extraBabelCompileNodeModules', is.isArray)
  this.config.themes = getConfigValue('themes', is.isObject)
  this.config.exposes = getConfigValue('exposes', is.isObject)
  this.config.shared = getConfigValue('shared', is.isObject)

  this.config.loading = getLoading(this)
  this.config.error = getError(this)

  this.config.plugins = getPlugins(this)
}

module.exports = Config
