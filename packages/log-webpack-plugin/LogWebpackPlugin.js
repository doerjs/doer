import chalk from 'chalk'
import dayjs from 'dayjs'

class LogWebpackPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('LogWebpackPlugin', (stats) => {
      const statsJSONData = stats.toJson({}, true)

      setTimeout(() => {
        if (!statsJSONData.errors.length) {
          console.info(
            `👣 ${chalk.green('成功编译')}，${chalk.green('祝你编码愉快 <(￣ˇ￣)/')}，总共用时 ${this.formatTime(
              statsJSONData.time,
            )}`,
          )
          console.info(
            `👣 ${chalk.red(statsJSONData.errors.length)} 个错误，${chalk.yellow(
              statsJSONData.warnings.length,
            )} 个警告`,
          )
          console.info()
          this.printAssets(statsJSONData)
          console.info()
        } else {
          console.info(
            `👣 ${chalk.red('编译失败')}，${chalk.red('一点小小状况 ﾍ(。_。)>')}，总共用时 ${this.formatTime(
              statsJSONData.time,
            )}`,
          )
          console.info(
            `👣 ${chalk.red(statsJSONData.errors.length)} 个错误，${chalk.yellow(
              statsJSONData.warnings.length,
            )} 个警告`,
          )
          console.info()
        }

        this.printWarning(statsJSONData)
        this.printErrors(statsJSONData)
      }, 0)
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

    const unit = units[i]
    const message = `${size} ${unit}`
    if (unit === 'kb' && size > 500) {
      return chalk.yellow(message)
    }

    if (unit === 'mb') {
      return chalk.yellow(chalk.bold(message))
    }

    return chalk.green(message)
  }

  formatTime(millisecond) {
    if (millisecond < 1000) {
      return chalk.green(`${millisecond}毫秒`)
    }

    const second = millisecond / 1000

    if (second < 60) {
      return chalk.green(`${second}秒`)
    }

    const minute = second / 60

    return chalk.yellow(`${minute}分钟`)
  }

  printAssets(stats) {
    stats.assets
      .sort((a, b) => a.size - b.size)
      .forEach((asset) => {
        console.info('👣  ', asset.name, '  ', this.formatSize(asset.size))
      })
  }

  printErrors(stats) {
    stats.errors.forEach((error) => {
      console.info(
        `👣 ${chalk.red('[X]')} ${dayjs().format(this.DATE_FORMAT)} 编译错误：${chalk.green(error.moduleName || '')}`,
      )
      console.info(chalk.red(error.stack))
    })
  }

  printWarning(stats) {
    stats.warnings.forEach((warn) => {
      console.info(
        `👣 ${chalk.yellow('[!]')} ${dayjs().format(this.DATE_FORMAT)} 编译告警：${chalk.green(warn.moduleName || '')}`,
      )
      console.info(chalk.yellow(warn.stack))
    })
  }
}

export default LogWebpackPlugin
