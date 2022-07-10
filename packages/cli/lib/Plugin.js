'use strict'

const { SyncHook, /* AsyncParallelHook, */ AsyncSeriesHook } = require('tapable')

const registerStyleLoader = require('./style')
const registerBabelLoader = require('./babel')

function Plugin() {
  this.hooks = {
    plugins: new AsyncSeriesHook(['plugin']),
    plugin: new SyncHook(['option', 'plugin']),
    afterPlugin: new SyncHook(['option', 'plugin']),
    afterPlugins: new AsyncSeriesHook(['plugin']),

    environment: new SyncHook(['environment']),

    complier: new SyncHook([]),
    afterComplier: new SyncHook(['complier']),
    webpack: new AsyncSeriesHook(['webpackChain']),
    webpackConfig: new AsyncSeriesHook(['webpackConfig']),

    server: new SyncHook([]),
    afterServer: new SyncHook(['server']),
    devServer: new AsyncSeriesHook(['config']),
  }
}

Plugin.prototype.registerStyleLoader = function (webpackChain, option) {
  registerStyleLoader(webpackChain, option)
}

Plugin.prototype.registerBabelLoader = function (webpackChain, option) {
  registerBabelLoader(webpackChain, option)
}

module.exports = Plugin
