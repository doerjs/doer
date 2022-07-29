'use strict'

process.env.NODE_ENV = 'development'
if (!process.env.ENV) {
  process.env.ENV = 'dev'
}

const Doer = require('../lib/Doer')

module.exports = async function dev() {
  const doer = new Doer()
  await doer.init()
  await doer.createComplier()
  await doer.runServer()
}
