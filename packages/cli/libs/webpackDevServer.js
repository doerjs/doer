'use strict'

const path = require('path')
const WebpackDevServer = require('webpack-dev-server')

const paths = require('./paths')
const file = require('./utils/file')
const util = require('./utils/util')

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

function createConfig(appConfig) {
  return {
    allowedHosts: 'all',
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || '3000',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    compress: true,
    static: {
      directory: paths.appPaths.publicDirectory,
      publicPath: paths.appPaths.publicUrlPath,
    },
    client: {
      logging: 'warn',
      overlay: false,
      progress: true,
    },
    open: false,
    hot: false,
    liveReload: true,
    devMiddleware: {
      publicPath: paths.appPaths.publicUrlPath.slice(0, -1),
    },
    https: getHttpsConfig(),
    // TODO
    // proxy: appConfig.proxy,
  }
}

module.exports = function createDevServer({ webpackConfig, compiler, appConfig }) {
  const server = new WebpackDevServer(createConfig(appConfig), compiler)

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
    // 服务器启动成功
  })

  server.stopCallback(() => {
    // 服务器停止成功
  })
}
