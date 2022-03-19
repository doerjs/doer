'use strict'

process.env.NODE_ENV = 'development'

require('../libs/env')
const createDevServer = require('../libs/webpackDevServer')
const createCompiler = require('../libs/webapckComplier')
const paths = require('../libs/paths')

process.on('unhandledRejection', (err) => {
  throw err
})

const appConfig = paths.getAppConfig()

const compiler = createCompiler({
  appConfig,
})
const server = createDevServer({
  compiler,
  appConfig,
})

server.start()
