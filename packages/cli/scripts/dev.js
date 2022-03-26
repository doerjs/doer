'use strict'

process.env.NODE_ENV = 'development'

require('../libs/env')
const createDevServer = require('../libs/webpackDevServer')
const createCompiler = require('../libs/webpackComplier')
const config = require('../libs/config')

process.on('unhandledRejection', (err) => {
  throw err
})

module.exports = function dev() {
  const appConfig = config()

  const compiler = createCompiler({
    appConfig,
  })

  createDevServer({
    compiler,
    appConfig,
  })
}
