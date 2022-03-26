const path = require('path')
const is = require('@doerjs/utils/is')

const file = require('./utils/file')
const logger = require('./utils/logger')
const paths = require('./paths')

/**
 * loading配置支持两种模式
 * 1. 页面和布局共用一个loading组件
 *    loading: './src/components/Loading'
 * 2. 页面和布局单独配置loading组件
 *    loading: {
 *      page: './src/components/Loading',
 *      layout: './src/layouts/Loading',
 *    }
 */
function checkLoading(loading, errors) {
  if (is.isUndefined(loading)) {
    return
  }

  if ((!is.isString(loading) && !is.isObject(loading)) || !loading) {
    errors.push('<loading> 配置格式错误')
    return
  }

  function check(loadingPath) {
    const loadingFullPath = path.resolve(paths.cliPaths.runtimePath, loadingPath)
    const realLoadingFullPath = paths.resolveScripts(loadingFullPath)
    return !!realLoadingFullPath
  }

  if (is.isString(loading)) {
    !check(loading) && errors.push('<loading> 配置的组件地址不存在')
    return
  }

  // loading配置为第二种情况
  const { page, layout } = loading
  if (!page) {
    errors.push('<loading.page> 配置格式错误')
  }

  if (!layout) {
    errors.push('<loading.layout> 配置格式错误')
  }

  if (is.isString(page)) {
    !check(page) && errors.push('<loading.page> 配置的组件地址不存在')
  }

  if (is.isString(layout)) {
    !check(layout) && errors.push('<loading.layout> 配置的组件地址不存在')
  }
}

function validate(rawConfig) {
  const errors = []

  checkLoading(rawConfig.loading, errors)

  return errors.filter(Boolean)
}

function resolveConfig(rawConfig) {
  const { loading, ...config } = rawConfig

  if (is.isString(loading)) {
    config.loading = {
      page: path.resolve(paths.cliPaths.runtimePath, loading),
      layout: path.resolve(paths.cliPaths.runtimePath, loading),
    }
  }

  if (is.isObject(loading)) {
    config.loading = {
      page: loading.page ? path.resolve(paths.cliPaths.runtimePath, loading.page) : '',
      layout: loading.layout ? path.resolve(paths.cliPaths.runtimePath, loading.layout) : '',
    }
  }

  return config
}

// 获取app配置信息
module.exports = function getConfig() {
  if (!file.isExist(paths.appPaths.configPath)) {
    return {}
  }

  const rawConfig = require(paths.appPaths.configPath)

  const errors = validate(rawConfig)
  if (!errors.length) {
    return resolveConfig(rawConfig)
  }

  errors.forEach((error) => {
    logger.fail(error)
    process.exit(-1)
  })
}
