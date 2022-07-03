'use strict'

const Paths = require('./Paths')
const Plugin = require('./Plugin')
const Env = require('./Env')
const Config = require('./Config')
const Webpack = require('./Webpack')
const WebpackServer = require('./WebpackServer')

function Doer() {
  this.plugin = new Plugin()
  this.paths = new Paths()
  this.env = new Env({ paths: this.paths })
  this.config = new Config({ paths: this.paths })

  this.complier = null
  this.server = null
}

Doer.prototype.run = async function () {
  this.env.parseFile()
  this.plugin.hooks.env.call()

  // 环境变量解析依赖于publicUrlPath
  this.paths.parsePublicUrlPath()
  this.env.parseEnv()
  this.plugin.hooks.afterEnv.call(this.env)

  this.config.parseFile()
  this.plugin.hooks.config.call(this.config)
  this.config.parseConfig()
  this.plugin.hooks.afterConfig.call(this.config)

  await this.runPlugins()
  await this.runComplier()
}

Doer.prototype.runPlugins = async function () {
  const plugins = this.config.config.plugins
  if (!plugins.length) {
    return
  }

  await this.plugin.hooks.plugins.promise(this.plugin)

  plugins.forEach((plugin) => {
    this.plugin.hooks.plugin.call(plugin, this.plugin)
    require(plugin.path)(this.plugin, plugin.option)
    this.plugin.hooks.afterPlugin.call(plugin, this.plugin)
  })

  await this.plugin.hooks.afterPlugins.promise(this.plugin)
}

Doer.prototype.runComplier = async function () {
  this.plugin.hooks.complier.call()
  this.complier = new Webpack({
    env: this.env,
    paths: this.paths,
    config: this.config,
    plugin: this.plugin,
  })

  await this.complier.run()
  this.plugin.hooks.afterComplier.call(this.complier)
}

Doer.prototype.runServer = async function () {
  this.plugin.hooks.server.call()
  this.server = new WebpackServer({
    env: this.env,
    paths: this.paths,
    config: this.config,
    plugin: this.plugin,
    complier: this.complier,
  })

  await this.server.run()
  this.plugin.hooks.afterServer.call(this.server)
}

module.exports = Doer
