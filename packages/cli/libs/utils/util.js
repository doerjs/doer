'use strict'

const path = require('path')
const is = require('@doerjs/utils/is')

const logger = require('./logger')

function assert(check, message) {
  if (is.isFunction(check) && !check()) {
    logger.fail(message)
    process.exit(-1)
    return false
  }

  if (!check) {
    logger.fail(message)
    process.exit(-1)
    return false
  }

  return true
}

function formatToPosixPath(filePath) {
  return filePath.replace(new RegExp(path.sep, 'g'), '/')
}

function firstCharToUpperCase(str) {
  return str.replace(/^\S/, (c) => c.toUpperCase())
}

module.exports = {
  assert,
  formatToPosixPath,
  firstCharToUpperCase,
}
