'use strict'

process.env.NODE_ENV = 'development'
process.env.ENV = 'dev'

const Doer = require('../lib/Doer')

module.exports = async function dev() {
  const doer = new Doer()
  await doer.run()
  await doer.runServer()
}
