'use strict'

process.env.NODE_ENV = 'production'
process.env.ENV = 'prod'

const Doer = require('../lib/Doer')

module.exports = async function build() {
  const doer = new Doer()
  await doer.run()
}
