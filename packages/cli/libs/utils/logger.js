'use strict'

const chalk = require('chalk')

function log(message) {
  console.log(`👣 [ ] ${message}`)
}

function warn(message) {
  console.log(`👣 ${chalk.yellow('[!]')} ${message}`)
}

function success(message) {
  console.log(`👣 ${chalk.green('[√]')} ${message}`)
}

function fail(message) {
  console.log(`👣 ${chalk.red('[X]')} ${message}`)
}

module.exports = {
  log,
  fail,
  warn,
  success,
}
