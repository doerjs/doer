'use strict'

const ora = require('ora')
const chalk = require('chalk')

function clearConsole() {
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
}

class LoggerWebpackPlugin {
  constructor() {
    this.spinning = ora()
  }

  apply(compiler) {
    compiler.hooks.done.tap('LoggerWebpackPlugin', (stats) => {
      const statsJSONData = stats.toJson({}, true)

      clearConsole()

      setTimeout(() => {
        if (!statsJSONData.errors.length) {
          this.printAssets(statsJSONData)
        }

        this.printWarning(statsJSONData)
        this.printErrors(statsJSONData)
      }, 0)
    })

    compiler.hooks.initialize.tap('LoggerWebpackPlugin', () => {
      this.spinning.text = '应用启动中...'
      this.spinning.start()
    })

    compiler.hooks.compile.tap('LoggerWebpackPlugin', () => {
      this.spinning.stop()
    })
  }

  formatSize(size) {
    const units = ['b', 'kb', 'mb']
    let exp = Math.floor(Math.log(size) / Math.log(2))
    if (exp < 1) {
      exp = 0
    }
    const i = Math.floor(exp / 10)
    size = size / Math.pow(2, 10 * i)

    if (size.toString().length > size.toFixed(2).toString().length) {
      size = size.toFixed(2)
    }
    return size + ' ' + units[i]
  }

  printAssets(stats) {
    stats.assets
      .sort((a, b) => a.size - b.size)
      .forEach((asset) => {
        console.log('👣    ', asset.name, '  ', chalk.yellow(this.formatSize(asset.size)))
      })
  }

  printErrors(stats) {
    stats.errors.forEach((error) => {
      console.log(chalk.red(error.stack))
    })
  }

  printWarning(stats) {
    stats.warnings.forEach((error) => {
      console.log(chalk.yellow(error.stack))
    })
  }
}

module.exports = LoggerWebpackPlugin
