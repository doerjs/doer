'use strict'

const chalk = require('chalk')
const dayjs = require('dayjs')

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

function log(message) {
  console.log(`👣 [ ] ${dayjs().format(DATE_FORMAT)} ${message}`)
}

function warn(message) {
  console.log(`👣 ${chalk.yellow('[!]')} ${dayjs().format(DATE_FORMAT)} ${message}`)
}

function success(message) {
  console.log(`👣 ${chalk.green('[√]')} ${dayjs().format(DATE_FORMAT)} ${message}`)
}

function fail(message) {
  console.log(`👣 ${chalk.red('[X]')} ${dayjs().format(DATE_FORMAT)} ${message}`)
}

module.exports = {
  log,
  fail,
  warn,
  success,
}
