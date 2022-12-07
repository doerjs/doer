'use strict'

const registerBabelLoader = require('../lib/babel')

module.exports = function babelLoader(webpack) {
  registerBabelLoader(webpack.webpackChain, {
    name: 'javascript',
    test: [/\.js$/, /\.jsx$/],
    include: webpack.paths.appPaths.contextPaths.concat(webpack.config.config.extraBabelCompileNodeModules),
  })
}
