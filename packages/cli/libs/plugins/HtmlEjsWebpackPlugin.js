'use strict'

const ejs = require('ejs')

class HtmlEjsWebpackPlugin {
  constructor(htmlWebpackPlugin, data) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.renderData = data
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HtmlEjsWebpackPlugin', (compilation) => {
      this.htmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap('HtmlEjsWebpackPlugin', (data) => {
        data.html = ejs.render(data.html, this.renderData)
      })
    })
  }
}

module.exports = HtmlEjsWebpackPlugin
