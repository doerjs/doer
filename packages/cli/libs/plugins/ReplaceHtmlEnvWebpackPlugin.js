'use strict'

function escapeStringRegexp(string) {
  if (typeof string !== 'string') {
    throw new TypeError('Expected a string')
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

class ReplaceHtmlEnvWebpackPlugin {
  constructor(htmlWebpackPlugin, replacements) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.replacements = replacements
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ReplaceHtmlEnvWebpackPlugin', (compilation) => {
      this.htmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap('ReplaceHtmlEnvWebpackPlugin', (data) => {
        Object.keys(this.replacements).forEach((key) => {
          const value = this.replacements[key]
          data.html = data.html.replace(new RegExp('%' + escapeStringRegexp(key) + '%', 'g'), value)
        })
      })
    })
  }
}

module.exports = ReplaceHtmlEnvWebpackPlugin
