'use strict'

const childProcess = require('child_process')
const util = require('util')

module.exports = {
  execSync: childProcess.execSync,
  exec: util.promisify(childProcess.exec),
}
