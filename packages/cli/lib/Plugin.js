'use strict'

const { SyncHook, /* AsyncParallelHook, */ AsyncSeriesHook } = require('tapable')

const registerStyleLoader = require('./style')

function Plugin() {
  this.hooks = {
    plugins: new AsyncSeriesHook(['plugin']),
    plugin: new SyncHook(['option', 'plugin']),
    afterPlugin: new SyncHook(['option', 'plugin']),
    afterPlugins: new AsyncSeriesHook(['plugin']),

    environment: new SyncHook(['doer']),

    complier: new SyncHook([]),
    afterComplier: new SyncHook(['complier']),
    webpack: new AsyncSeriesHook(['webpackChain']),

    server: new SyncHook([]),
    afterServer: new SyncHook(['server']),
    devServer: new AsyncSeriesHook(['config']),
  }
}

Plugin.prototype.registerStyleLoader = function (webpackChain, option) {
  registerStyleLoader(webpackChain, option)
}

module.exports = Plugin
