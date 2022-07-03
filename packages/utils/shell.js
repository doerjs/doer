'use strict'

const childProcess = require('node:child_process')
const util = require('node:util')

module.exports = {
  execSync: childProcess.execSync,
  exec: util.promisify(childProcess.exec),
}
