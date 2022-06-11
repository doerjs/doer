'use strict'

process.env.NODE_ENV = 'development'
process.env.ENV = 'dev'
require('../libs/env').parseEnv()

const { createDevServer } = require('../libs/webpackDevServer')
const { createCompiler } = require('../libs/webpackComplier')
const { getConfig } = require('../libs/config')

process.on('unhandledRejection', (err) => {
  throw err
})

module.exports = function dev() {
  const appConfig = getConfig()

  const compiler = createCompiler({
    appConfig,
  })
  createDevServer({
    compiler,
    appConfig,
  })
}
