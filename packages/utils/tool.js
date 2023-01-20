'use strict'

const path = require('node:path')

function formatToPosixPath(filePath) {
  return filePath.replace(new RegExp(path.sep, 'g'), '/')
}

function firstCharToUpperCase(str) {
  return str.replace(/^\S/, (c) => c.toUpperCase())
}

module.exports = {
  formatToPosixPath,
  firstCharToUpperCase,
}
