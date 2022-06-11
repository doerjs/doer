'use strict'

process.env.NODE_ENV = 'production'
process.env.ENV = 'prod'
require('../libs/env').parseEnv()

const { createCompiler } = require('../libs/webpackComplier')
const { getConfig } = require('../libs/config')

process.on('unhandledRejection', (err) => {
  throw err
})

module.exports = function build() {
  const appConfig = getConfig()

  const compiler = createCompiler({
    appConfig,
  })
  compiler.run()
}
