'use strict'

const path = require('node:path')
const address = require('address')
const chalk = require('chalk')
const WebpackDevServer = require('webpack-dev-server')

function getHttpsConfig(option) {
  if (process.env.HTTPS !== 'true') return false

  const { HTTPS_KEY, HTTPS_CERT } = process.env
  if (process.env.HTTPS_CERT && process.env.HTTPS_KEY) {
    const keyFilePath = path.resolve(option.paths.cliPaths.runtimePath, HTTPS_KEY)
    const certFilePath = path.resolve(option.paths.cliPaths.runtimePath, HTTPS_CERT)

    return {
      key: keyFilePath,
      cert: certFilePath,
    }
  }
}

function resolveServerUrl(option) {
  const host = process.env.HOST
  const port = process.env.PORT
  const publicPath = process.env.PUBLIC_URL

  const protocol = process.env.HTTPS === 'true' ? 'https://' : 'http://'
  const localhost = host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host

  return {
    localUrl: `${protocol}${localhost}:${port}${publicPath}`,
    realUrl: `${protocol}${address.ip()}:${port}${publicPath}`,
  }
}

function WebpackServer(option) {
  this.env = option.env
  this.paths = option.paths
  this.plugin = option.plugin
  this.config = option.config
  this.complier = option.complier

  this.webpackServer = null

  this.config = {}
}

WebpackServer.prototype.run = async function () {
  this.config = {
    allowedHosts: 'all',
    host: process.env.HOST,
    port: process.env.PORT,
    open: false,
    hot: false,
    liveReload: true,
    compress: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    static: {
      directory: this.paths.appPaths.publicDirectory,
      publicPath: process.env.PUBLIC_URL,
    },
    historyApiFallback: true,
    client: {
      logging: 'none',
      overlay: false,
      progress: false,
    },
    devMiddleware: {
      publicPath: process.env.PUBLIC_URL,
    },
    https: getHttpsConfig(this),
  }

  await this.plugin.hooks.devServer.promise(this.config)
  this.webpackServer = new WebpackDevServer(this.config, this.complier.webpackComplier)

  // 注册结束信号监听
  const closeSigns = ['SIGINT', 'SIGTERM']
  closeSigns.forEach((sign) => {
    process.on(sign, () => {
      this.webpackServer.stop()
      process.exit(0)
    })
  })

  process.stdin.on('end', () => {
    this.webpackServer.stop()
    process.exit(0)
  })

  const url = resolveServerUrl(this)
  this.webpackServer.startCallback(() => {
    let isFirstComplierDone = true

    this.complier.webpackComplier.hooks.done.tap('done', () => {
      setTimeout(() => {
        console.log(`👣 ${chalk.cyan('服务器启动成功')}`)
        console.log()
        console.log(`👣 ${chalk.cyan(url.localUrl)}`)
        console.log(`👣 ${chalk.cyan(url.realUrl)}`)
        console.log()

        if (isFirstComplierDone) {
          isFirstComplierDone = false
          import('clipboardy').then(({ default: clipboard }) => {
            clipboard.writeSync(url.localUrl)
            console.log(`👣 访问地址已经复制到剪贴板，粘贴到浏览器查看吧`)
          })
        }
      }, 0)
    })
  })

  this.webpackServer.stopCallback(() => {})
}

module.exports = WebpackServer
