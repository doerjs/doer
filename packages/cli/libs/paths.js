'use strict'

const path = require('path')
const resolve = require('resolve/sync')

const cliRuntimePath = process.cwd()
const cliRootPath = path.resolve(__dirname, '../')

const cliPaths = {
  rootPath: cliRootPath,
  runtimePath: cliRuntimePath,
  packageJsonPath: path.resolve(cliRootPath, 'package.json'),
  templatePath: path.resolve(cliRootPath, 'template'),
  nodeModulesPath: path.resolve(cliRootPath, 'node_modules'),
}

function getAppPublicUrlPath() {
  if (process.env.NODE_ENV === 'development') {
    const publicUrl = new URL(process.env.PUBLIC_URL, 'https://doer.cli.com')
    return publicUrl.pathname
  }

  return process.env.PUBLIC_URL
}

/**
 * 获取应用远程共享的资源地址
 */
function getRemotePublicUrlPath() {
  if (process.env.NODE_ENV === 'development') {
    const isHttps = process.env.HTTPS === 'true'
    const host = process.env.HOST
    const port = process.env.PORT

    const protocol = isHttps ? 'https://' : 'http://'
    const localhost = host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host

    return `${protocol}${localhost}:${port}${getAppPublicUrlPath()}`
  }

  return process.env.PUBLIC_URL
}

const appPaths = {
  env: path.resolve(cliPaths.runtimePath, './.env'),
  // app配置文件路径
  configPath: path.resolve(cliPaths.runtimePath, '.doerrc.js'),
  srcPath: path.resolve(cliPaths.runtimePath, 'src'),
  mockPath: path.resolve(cliPaths.runtimePath, 'mocks'),
  buildPath: path.resolve(cliPaths.runtimePath, 'dist'),
  packageJsonPath: path.resolve(cliPaths.runtimePath, 'package.json'),
  publicDirectory: path.resolve(cliPaths.runtimePath, './public'),
  nodeModulesPath: path.resolve(cliPaths.runtimePath, 'node_modules'),
}

function resolveScripts(filePath) {
  try {
    return resolve(filePath, { basedir: cliPaths.runtimePath, extensions: ['.js', '.jsx'] })
  } catch (error) {
    // no action
  }
}

module.exports = {
  cliPaths,
  appPaths,
  resolveScripts,
  getAppPublicUrlPath,
  getRemotePublicUrlPath,
}
