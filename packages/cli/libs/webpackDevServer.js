'use strict'

const path = require('path')
const WebpackDevServer = require('webpack-dev-server')
const address = require('address')
const chalk = require('chalk')

const paths = require('./paths')
const file = require('./utils/file')
const util = require('./utils/util')
const mock = require('./mock')

function getHttpsConfig() {
  const { HTTPS_KEY, HTTPS_CERT, HTTPS } = process.env

  const isHttps = HTTPS === 'true'

  if (isHttps && HTTPS_CERT && HTTPS_KEY) {
    const keyFilePath = path.resolve(paths.cliPaths.runtimePath, HTTPS_KEY)
    const certFilePath = path.resolve(paths.cliPaths.runtimePath, HTTPS_CERT)

    util.assert(() => file.isExist(keyFilePath), `指定的HTTPS证书key文件不存在，HTTPS_KEY=${keyFilePath}`)
    util.assert(() => file.isExist(certFilePath), `指定的HTTPS证书cert文件不存在，HTTPS_CERT=${certFilePath}`)

    // TODO 是否需要校验证书的正确性，这里暂时不校验，完成功能为主

    return {
      key: HTTPS_KEY,
      cert: HTTPS_CERT,
    }
  }

  return isHttps
}

function createConfig() {
  return {
    allowedHosts: 'all',
    host: process.env.HOST,
    port: process.env.PORT,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    compress: true,
    static: {
      directory: paths.appPaths.publicDirectory,
      publicPath: paths.getAppPublicUrlPath(),
    },
    client: {
      logging: 'none',
      overlay: false,
      progress: false,
    },
    open: false,
    hot: false,
    liveReload: true,
    devMiddleware: {
      publicPath: paths.getAppPublicUrlPath().slice(0, -1),
    },
    https: getHttpsConfig(),
    setupMiddlewares(middlewares, devServer) {
      if (process.env.MOCK === 'true') {
        mock(devServer.app)
      }

      return middlewares
    },
  }
}

function resolveServerUrl() {
  const isHttps = process.env.HTTPS === 'true'
  const host = process.env.HOST
  const port = process.env.PORT
  const publicPath = paths.getAppPublicUrlPath()

  const protocol = isHttps ? 'https://' : 'http://'
  const localhost = host === '127.0.0.1' || host === '0.0.0.0' ? 'localhost' : host

  return {
    localUrl: `${protocol}${localhost}:${port}${publicPath}`,
    realUrl: `${protocol}${address.ip()}:${port}${publicPath}`,
  }
}

function createDevServer({ webpackConfig, compiler, appConfig }) {
  const devServerConfig = createConfig(appConfig)
  const url = resolveServerUrl()
  const server = new WebpackDevServer(devServerConfig, compiler)

  // 注册结束信号监听
  const closeSigns = ['SIGINT', 'SIGTERM']
  closeSigns.forEach((sign) => {
    process.on(sign, () => {
      server.stop()
      process.exit(0)
    })
  })

  process.stdin.on('end', () => {
    server.stop()
    process.exit(0)
  })

  server.startCallback(() => {
    let isFirstComplierDone = true

    compiler.hooks.done.tap('done', () => {
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

  server.stopCallback(() => {})
}

module.exports = {
  createDevServer,
}
