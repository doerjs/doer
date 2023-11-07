'use strict'

const registerBabelLoader = require('../lib/babel')
const context = require('../context')

module.exports = function babelLoader(webpack) {
  registerBabelLoader(webpack.webpackChain, {
    name: 'javascript',
    test: [/\.js$/, /\.jsx$/],
    include: context.paths.contextPaths.concat(context.config.config.extraBabelCompileNodeModules),
  })
}
