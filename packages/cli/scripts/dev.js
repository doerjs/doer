'use strict'

process.env.NODE_ENV = 'development'

require('../libs/env')
const createDevServer = require('../libs/webpackDevServer')
const createCompiler = require('../libs/webpackComplier')
const paths = require('../libs/paths')

process.on('unhandledRejection', (err) => {
  throw err
})

module.exports = function dev() {
  const appConfig = paths.getAppConfig()

  const compiler = createCompiler({
    appConfig,
  })

  createDevServer({
    compiler,
    appConfig,
  })
}
