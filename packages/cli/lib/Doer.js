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

Doer.prototype.init = async function () {
  this.env.parseFile()
  this.env.parseEnv()
  this.config.parseFile()
  this.config.parseConfig()

  await this.plugins()

  this.plugin.hooks.environment.call(this)
}

Doer.prototype.plugins = async function () {
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

Doer.prototype.createComplier = async function () {
  this.plugin.hooks.complier.call()
  this.complier = new Webpack({
    env: this.env,
    paths: this.paths,
    config: this.config,
    plugin: this.plugin,
  })
  await this.complier.createComplier()
  this.plugin.hooks.afterComplier.call(this.complier)
}

Doer.prototype.runComplier = function () {
  this.complier.run()
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
  this.plugin.hooks.afterServer.call(this.server)
  await this.server.run()
}

module.exports = Doer
