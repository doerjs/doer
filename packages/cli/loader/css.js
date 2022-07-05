'use strict'

const registerStyleLoader = require('../lib/style')

module.exports = function cssLoader(webpack) {
  registerStyleLoader(webpack.webpackChain, {
    name: 'css',
    test: /\.css$/,
    exclude: [/\.module\.css$/],
  })
  registerStyleLoader(webpack.webpackChain, {
    name: 'cssModule',
    test: /\.module\.css$/,
    cssModule: true,
  })
}
