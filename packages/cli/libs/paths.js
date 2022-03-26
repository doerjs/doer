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
  let publicPath = process.env.PUBLIC_URL || '/'

  publicPath = publicPath.endsWith('/') ? publicPath : publicPath + '/'

  if (process.env.NODE_ENV === 'development') {
    const publicUrl = new URL(publicPath, 'https://doer.cli.com')
    return publicUrl.pathname
  }

  return publicPath
}

const appPaths = {
  // 环境变量路径
  env: path.resolve(cliPaths.runtimePath, './env'),
  // app配置文件路径
  configPath: path.resolve(cliPaths.runtimePath, '.doerrc.js'),
  srcPath: path.resolve(cliPaths.runtimePath, 'src'),
  buildPath: path.resolve(cliPaths.runtimePath, 'dist'),
  packageJsonPath: path.resolve(cliPaths.runtimePath, 'package.json'),
  publicDirectory: path.resolve(cliPaths.runtimePath, './public'),
  publicUrlPath: getAppPublicUrlPath(),
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
}
