'use strict'

const path = require('path')

const file = require('./utils/file')

const cliRootPath = path.resolve(__dirname, '../')
const cliRuntimePath = process.cwd()

const cliPaths = {
  rootPath: cliRootPath,
  runtimePath: cliRuntimePath,
  packageJsonPath: path.resolve(cliRootPath, 'package.json'),
  templatePath: path.resolve(cliRootPath, 'template'),
  nodeModulesPath: path.resolve(cliRootPath, 'node_modules'),
}

function getAppPublicUrlPath() {
  let publicPath = process.env.APP_PUBLIC_URL || '/'

  publicPath = publicPath.endsWith('/') ? publicPath : publicPath + '/'

  if (process.env.NODE_ENV === 'development') {
    const publicUrl = new URL(publicPath, 'https://traveler.cli.com')
    return publicUrl.pathname
  }

  return publicPath
}

const appPaths = {
  // 环境变量路径
  env: path.resolve(cliPaths.runtimePath, './env'),
  // app配置文件路径
  configPath: path.resolve(cliPaths.runtimePath, '.travelerrc.js'),
  srcPath: path.resolve(cliPaths.runtimePath, 'src'),
  buildPath: path.resolve(cliPaths.runtimePath, 'dist'),
  packageJsonPath: path.resolve(cliPaths.runtimePath, 'package.json'),
  publicDirectory: path.resolve(cliPaths.runtimePath, './public'),
  publicUrlPath: getAppPublicUrlPath(),
  nodeModulesPath: path.resolve(cliPaths.runtimePath, 'node_modules'),
}

// 获取app配置信息
function getAppConfig() {
  if (!file.isExist(appPaths.configPath)) {
    return {}
  }

  return require(appPaths.configPath)
}

module.exports = {
  cliPaths,
  appPaths,
  getAppConfig,
}
