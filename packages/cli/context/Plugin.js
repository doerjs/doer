'use strict'

const { SyncHook, /* AsyncParallelHook, */ AsyncSeriesHook } = require('tapable')

class Plugin {
  // 单例实例
  static instance = null

  static getInstance() {
    if (!Plugin.instance) {
      Plugin.instance = new Plugin()
    }
    return Plugin.instance
  }

  hooks = {
    plugins: new AsyncSeriesHook(['plugin']),
    plugin: new SyncHook(['option', 'plugin']),
    afterPlugin: new SyncHook(['option', 'plugin']),
    afterPlugins: new AsyncSeriesHook(['plugin']),

    environment: new SyncHook(['context']),

    complier: new SyncHook([]),
    afterComplier: new SyncHook(['complier']),
    webpack: new AsyncSeriesHook(['webpackChain']),
    webpackConfig: new AsyncSeriesHook(['webpackConfig']),

    server: new SyncHook([]),
    afterServer: new SyncHook(['server']),
    devServer: new AsyncSeriesHook(['config']),
  }
}

module.exports = Plugin.getInstance()
