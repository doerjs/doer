'use strict'

const chalk = require('chalk')

function log(message) {
  console.log(`👣 [ ] ${message}`)
}

function warn(message) {
  console.log(`👣 ${chalk.yellowBright('[!]')} ${message}`)
}

function success(message) {
  console.log(`👣 ${chalk.greenBright('[√]')} ${message}`)
}

function fail(message) {
  console.log(`👣 ${chalk.redBright('[X]')} ${message}`)
}

module.exports = {
  log,
  fail,
  warn,
  success,
}
