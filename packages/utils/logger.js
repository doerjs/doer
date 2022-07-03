'use strict'

const chalk = require('chalk')
const dayjs = require('dayjs')

function Logger() {
  this.DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
}

Logger.prototype.log = function (message) {
  console.log(`👣 [ ] ${dayjs().format(this.DATE_FORMAT)} ${message}`)
}

Logger.prototype.warn = function (message) {
  console.log(`👣 ${chalk.yellow('[!]')} ${dayjs().format(this.DATE_FORMAT)} ${message}`)
}

Logger.prototype.success = function (message) {
  console.log(`👣 ${chalk.green('[√]')} ${dayjs().format(this.DATE_FORMAT)} ${message}`)
}

Logger.prototype.fail = function (message) {
  console.log(`👣 ${chalk.red('[X]')} ${dayjs().format(this.DATE_FORMAT)} ${message}`)
}

module.exports = new Logger()
