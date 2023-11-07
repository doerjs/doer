'use strict'

const Webpack = require('./Webpack')
const WebpackServer = require('./WebpackServer')
const context = require('../context')

const registerStyleLoader = require('./style')
const registerBabelLoader = require('./babel')

function Doer() {
  this.complier = null
  this.server = null
}

Doer.prototype.init = async function () {
  await this.plugins()
  context.plugin.hooks.environment.call(context)
}

Doer.prototype.plugins = async function () {
  const plugins = context.config.config.plugins
  if (!plugins.length) {
    return
  }

  await context.plugin.hooks.plugins.promise(context.plugin)

  plugins.forEach((plugin) => {
    context.plugin.hooks.plugin.call(plugin, context.plugin)
    require(plugin.path)(context.plugin, plugin.option, { registerBabelLoader, registerStyleLoader })
    context.plugin.hooks.afterPlugin.call(plugin, context.plugin)
  })

  await context.plugin.hooks.afterPlugins.promise(context.plugin)
}

Doer.prototype.createComplier = async function () {
  context.plugin.hooks.complier.call()
  this.complier = new Webpack()
  await this.complier.createComplier()
  context.plugin.hooks.afterComplier.call(this.complier)
}

Doer.prototype.runComplier = function () {
  this.complier.run()
}

Doer.prototype.runServer = async function () {
  context.plugin.hooks.server.call()
  this.server = new WebpackServer({
    complier: this.complier,
  })
  context.plugin.hooks.afterServer.call(this.server)
  await this.server.run()
}

module.exports = Doer
