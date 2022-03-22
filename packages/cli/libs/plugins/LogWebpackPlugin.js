'use strict'

function clearConsole() {
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
}

class LoggerWebpackPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('LoggerWebpackPlugin', (stats) => {
      const statsJSONData = stats.toJson({}, true)
      this.printWarning(statsJSONData)
      this.printErrors(statsJSONData)
    })
    compiler.hooks.compile.tap('LoggerWebpackPlugin', () => {
      clearConsole()
    })
  }

  printErrors(assets) {
    assets.errors.forEach((error) => {
      console.log(error.stack)
    })
  }

  printWarning(assets) {
    assets.warnings.forEach((error) => {
      console.log(error.stack)
    })
  }
}

module.exports = LoggerWebpackPlugin
