const path = require('path')
const is = require('@doerjs/utils/is')

const file = require('./utils/file')
const logger = require('./utils/logger')
const paths = require('./paths')

const defaultConfig = {
  alias: {},
  extraBabelCompileNodeModules: [],
  themes: {},
  exposes: {},
  shared: {},
  loading: {},
  error: {},
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

function resolvePath(filePath, alias) {
  if (path.isAbsolute(filePath)) {
    return filePath
  }

  const aliasName = Object.keys(alias).find((name) => {
    return filePath.startsWith(name)
  })
  let relativeFilePath
  if (aliasName) {
    relativeFilePath = filePath.replace(aliasName, '.')
  }

  return path.resolve(paths.cliPaths.runtimePath, relativeFilePath)
}

function getLoading(rawConfig, config) {
  if (is.isString(rawConfig.loading)) {
    const loadingFilePath = resolvePath(rawConfig.loading, config.alias)
    return {
      page: loadingFilePath,
      layout: loadingFilePath,
    }
  }

  if (is.isObject(rawConfig.loading)) {
    return {
      page: is.isString(rawConfig.loading.page) ? resolvePath(rawConfig.loading.page, config.alias) : undefined,
      layout: is.isString(rawConfig.loading.layout) ? resolvePath(rawConfig.loading.layout, config.alias) : undefined,
    }
  }

  if (is.isUndefined(rawConfig.loading)) {
    return defaultConfig.loading
  }

  logger.fail(`无效的配置项[ loading ]，请检查.doerrc.js文件中的配置`)
  process.exit(-1)
}

function getError(rawConfig, config) {
  if (is.isString(rawConfig.error)) {
    const errorFilePath = resolvePath(rawConfig.error, config.alias)
    return {
      page: errorFilePath,
      layout: errorFilePath,
    }
  }

  if (is.isObject(rawConfig.error)) {
    return {
      page: is.isString(rawConfig.error.page) ? resolvePath(rawConfig.error.page, config.alias) : undefined,
      layout: is.isString(rawConfig.error.layout) ? resolvePath(rawConfig.error.layout, config.alias) : undefined,
    }
  }

  if (is.isUndefined(rawConfig.error)) {
    return defaultConfig.error
  }

  logger.fail(`无效的配置项[ error ]，请检查.doerrc.js文件中的配置`)
  process.exit(-1)
}

function getConfig() {
  const hasConfigFile = file.isExist(paths.appPaths.configPath)
  if (!hasConfigFile) return defaultConfig

  const rawConfig = require(paths.appPaths.configPath)
  const getConfigValue = createConfigFactory(rawConfig)

  const config = {}

  config.alias = getConfigValue('alias', is.isObject)
  config.extraBabelCompileNodeModules = getConfigValue('extraBabelCompileNodeModules', is.isArray)
  config.themes = getConfigValue('themes', is.isObject)
  config.exposes = getConfigValue('exposes', is.isObject)
  config.shared = getConfigValue('shared', is.isObject)

  config.loading = getLoading(rawConfig, config)
  config.error = getError(rawConfig, config)

  return config
}

module.exports = {
  getConfig,
}
