import { cliPaths } from './path.js'
import file from './file.js'

function getNodeVersion() {
  return process.version.replace('v', '')
}

function getVersion() {
  const pkgJsonFilePath = cliPaths.packageJsonPath

  if (file.isExist(pkgJsonFilePath)) {
    const pkgJson = file.readFile(pkgJsonFilePath)
    try {
      const pkg = JSON.parse(pkgJson)
      return pkg.version
    } catch (e) {}
  }
}

function check(data, type) {
  return Object.prototype.toString.call(data) === type
}

function isUndefined(data) {
  return check(data, '[object Undefined]')
}

function isString(data) {
  return check(data, '[object String]')
}

function isFunction(data) {
  return check(data, '[object Function]')
}

function isRegExp(data) {
  return check(data, '[object RegExp]')
}

export default {
  getVersion,
  getNodeVersion,
  isString,
  isFunction,
  isUndefined,
  isRegExp,
}
