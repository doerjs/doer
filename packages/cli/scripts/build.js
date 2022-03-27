'use strict'

process.env.NODE_ENV = 'production'

require('../libs/env')
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
  compiler.run()
}
