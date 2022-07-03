'use strict'

const path = require('node:path')
const file = require('@doerjs/utils/file')

const cliBasePaths = require('./cliBasePaths')

function getCliPaths() {
  return cliBasePaths
}

function getAppPaths(cliPaths) {
  const srcPath = path.resolve(cliPaths.runtimePath, 'src')
  const publicDirectory = path.resolve(cliPaths.runtimePath, './public')
  const htmlPath = path.resolve(publicDirectory, 'index.html')

  const tempComplierName = process.env.NODE_ENV === 'production' ? '.doer.prod' : '.doer'
  const tempComplierPath = path.resolve(srcPath, tempComplierName)

  return {
    env: path.resolve(cliPaths.runtimePath, '.env'),
    entryPath: path.resolve(tempComplierPath, 'index.js'),
    configPath: path.resolve(cliPaths.runtimePath, '.doerrc.js'),
    srcPath,
    mockPath: path.resolve(cliPaths.runtimePath, 'mocks'),
    buildPath: path.resolve(cliPaths.runtimePath, 'dist'),
    packageJsonPath: path.resolve(cliPaths.runtimePath, 'package.json'),
    publicDirectory,
    nodeModulesPath: path.resolve(cliPaths.runtimePath, 'node_modules'),
    htmlPath,
    tempComplierPath,
  }
}

function Paths() {
  this.cliPaths = getCliPaths()
  this.appPaths = getAppPaths(this.cliPaths)
}

Paths.prototype.parsePublicUrlPath = function () {
  let publicUrlPath
  if (process.env.NODE_ENV === 'development') {
    const publicUrl = new URL(process.env.PUBLIC_URL, 'https://doer.cli.com')
    publicUrlPath = publicUrl.pathname
  } else {
    publicUrlPath = process.env.PUBLIC_URL
  }

  if (publicUrlPath) {
    this.appPaths.publicUrlPath = publicUrlPath.endsWith('/') ? publicUrlPath : publicUrlPath + '/'
  } else {
    this.appPaths.publicUrlPath = '/'
  }
}

Paths.prototype.resolveAliasRelativePath = function (filePath, alias) {
  const aliasName = Object.keys(alias).find((name) => {
    return filePath.startsWith(name)
  })

  if (aliasName) {
    return filePath.replace(aliasName, alias[aliasName])
  }

  return filePath
}

Paths.prototype.resolvePath = function (filePath, alias) {
  if (path.isAbsolute(filePath)) {
    return filePath
  }

  const relativeFilePath = this.resolveAliasRelativePath(filePath, alias)

  const modules = [this.appPaths.srcPath, this.appPaths.nodeModulesPath, this.cliPaths.nodeModulesPath]

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

Paths.prototype.getRemotePublicUrlPath = function () {
  if (process.env.NODE_ENV === 'development') {
    const isHttps = process.env.HTTPS === 'true'
    const host = process.env.HOST
    const port = process.env.PORT

    const protocol = isHttps ? 'https://' : 'http://'
    const localhost = host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host

    return `${protocol}${localhost}:${port}${this.appPaths.publicUrlPath}`
  }

  return this.appPaths.publicUrlPath
}

module.exports = Paths
