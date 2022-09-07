'use strict'

const path = require('node:path')
const webpack = require('webpack')

const WebpackChain = require('webpack-chain')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractWebpackPlugin = require('mini-css-extract-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ExternalRemotesWebpackPlugin = require('external-remotes-plugin')

const ReplaceHtmlEnvWebpackPlugin = require('../plugin/ReplaceHtmlEnvWebpackPlugin')
const LogWebpackPlugin = require('../plugin/LogWebpackPlugin')
const RemoteWebpackPlugin = require('../plugin/RemoteWebpackPlugin')
const RouterWebpackPlugin = require('../plugin/RouterWebpackPlugin')

const svgLoader = require('../loader/svg')
const cssLoader = require('../loader/css')
const babelLoader = require('../loader/babel')

const shared = require('./shared')

const { ModuleFederationPlugin } = webpack.container

function Webpack(option) {
  this.env = option.env
  this.paths = option.paths
  this.plugin = option.plugin
  this.config = option.config

  this.webpackComplier = null

  this.webpackChain = new WebpackChain()
}

Webpack.prototype.run = function () {
  this.webpackComplier.run()
}

Webpack.prototype.createComplier = async function () {
  const isProduction = process.env.NODE_ENV === 'production'
  const isEnableProfiler = isProduction && process.env.ENABLE_PROFILER === 'true'
  const isEnableGzip = process.env.GZIP === 'true'
  const isEnableAnalyzer = process.env.ENABLE_ANALYZER === 'true'
  const assetModuleFilename = isProduction ? 'static/media/[name].[contenthash:8][ext]' : 'static/media/[name][ext]'
  const appPackage = require(this.paths.appPaths.packageJsonPath)

  this.webpackChain.mode(isProduction ? 'production' : 'development')
  // 生产环境下当编译出现出现错误时，立刻停止编译，而不是继续打包
  this.webpackChain.bail(isProduction)
  this.webpackChain.entry('main').add(this.paths.appPaths.entryPath).end()
  this.webpackChain.devtool(isProduction ? 'source-map' : 'cheap-module-source-map')

  this.output({ isProduction })
  this.resolve({ isEnableProfiler })
  this.module({ isProduction, assetModuleFilename })
  this.plugins({ isProduction, isEnableGzip, isEnableAnalyzer, appPackage })
  this.optimization({ isProduction, isEnableProfiler })

  this.webpackChain.stats('none')

  await this.plugin.hooks.webpack.promise(this.webpackChain)

  const webpackConfig = this.webpackChain.toConfig()
  webpackConfig.output.assetModuleFilename = assetModuleFilename
  webpackConfig.output.uniqueName = appPackage.name

  webpackConfig.infrastructureLogging = {
    level: 'none',
  }

  await this.plugin.hooks.webpackConfig.promise(webpackConfig)
  this.webpackComplier = webpack(webpackConfig)
}

Webpack.prototype.output = function ({ isProduction }) {
  this.webpackChain.output
    .path(this.paths.appPaths.buildPath)
    .pathinfo(isProduction)
    .filename(isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/main.js')
    .chunkFilename(isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js')
    .publicPath(process.env.PUBLIC_URL)
}

Webpack.prototype.resolve = function ({ isEnableProfiler }) {
  this.webpackChain.context(this.paths.cliPaths.runtimePath)

  this.webpackChain.resolve.symlinks(true)

  this.webpackChain.resolve.modules.add('node_modules').end()

  this.webpackChain.resolve.extensions.add('.js').add('.jsx').add('.json').end()

  this.webpackChain.when(isEnableProfiler, (config) => {
    config.resolve.alias
      .set('react-dom$', 'react-dom/profiling')
      .set('scheduler/tracing', 'scheduler/tracing-profiling')
      .end()
  })

  const alias = this.config.config.alias
  const webpackAlias = this.webpackChain.resolve.alias
  Object.keys(alias).forEach((name) => {
    webpackAlias.set(name, path.resolve(this.paths.cliPaths.runtimePath, alias[name]))
  })
  webpackAlias.end()
}

Webpack.prototype.module = function (option) {
  // 将缺失的导出提示成错误而不是警告
  this.webpackChain.module.strictExportPresence(true)

  const sourceMapRule = this.webpackChain.module
    .rule('sourceMap')
    .test([/\.js$/, /\.jsx$/, /\.css$/])
    .enforce('pre')
  sourceMapRule.exclude.add(/@babel(?:\/|\\{1,2})runtime/).end()
  sourceMapRule.use('sourceMap').loader(require.resolve('source-map-loader')).end()
  sourceMapRule.end()

  this.webpackChain.module
    .rule('image')
    .type('asset')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
    .parser({
      dataUrlCondition: {
        maxSize: process.env.IMAGE_INLINE_LIMIT_SIZE,
      },
    })
    .end()

  svgLoader(this, option)
  cssLoader(this, option)
  babelLoader(this, option)

  this.webpackChain.module
    .rule('resource')
    .type('asset/resource')
    .test([/\.json$/, /\.txt$/, /\.eot$/, /\.woff$/, /\.woff2$/, /\.ttf$/])
    .end()
}

Webpack.prototype.plugins = function ({ isProduction, isEnableGzip, isEnableAnalyzer, appPackage }) {
  this.webpackChain.plugin('html').use(HtmlWebpackPlugin, [
    {
      inject: true,
      template: this.paths.appPaths.htmlPath,
      ...(isProduction
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        : {}),
    },
  ])

  this.webpackChain.plugin('replaceHtmlEnv').use(ReplaceHtmlEnvWebpackPlugin, [
    {
      HtmlWebpackPlugin,
      env: this.env.env,
    },
  ])

  this.webpackChain.plugin('define').use(webpack.DefinePlugin, [this.env.stringify()])

  this.webpackChain.plugin('miniCssExtract').use(MiniCssExtractWebpackPlugin, [
    {
      filename: isProduction ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
      chunkFilename: isProduction ? 'static/css/[name].[contenthash:8].chunk.css' : 'static/css/[name].chunk.css',
    },
  ])

  this.webpackChain.plugin('ignore').use(webpack.IgnorePlugin, [
    {
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    },
  ])

  this.webpackChain.plugin('log').use(LogWebpackPlugin)

  isEnableGzip && this.webpackChain.plugin('compression').use(CompressionWebpackPlugin)

  isEnableAnalyzer && this.webpackChain.plugin('analyzer').use(BundleAnalyzerPlugin)

  isProduction && this.webpackChain.plugin('clean').use(CleanWebpackPlugin)

  const remoteFileName = 'remote.js'
  this.webpackChain.plugin('router').use(RouterWebpackPlugin, [
    {
      appPackage,
      appConfig: this.config.config,
      outputPath: this.paths.appPaths.tempComplierPath,
      srcPath: this.paths.appPaths.srcPath,
      publicPath: this.paths.getRemotePublicUrlPath(),
      remoteFileName,
      extensions: ['.js', '.jsx'],
    },
  ])
  this.webpackChain
    .entry(appPackage.name)
    .add(path.resolve(this.paths.appPaths.tempComplierPath, 'publicPath.js'))
    .end()

  this.webpackChain.plugin('moduleFederation').use(ModuleFederationPlugin, [
    {
      name: appPackage.name,
      filename: remoteFileName,
      exposes: {
        ...this.config.config.exposes,
        './$$Router': path.resolve(this.paths.appPaths.tempComplierPath, 'Router.jsx'),
        './$$app': path.resolve(this.paths.appPaths.tempComplierPath, 'global.js'),
      },
      shared: {
        ...this.config.config.shared,
        ...shared,
      },
    },
  ])
  this.webpackChain.plugin('externalRemotes').use(ExternalRemotesWebpackPlugin)
  this.webpackChain.plugin('remote').use(RemoteWebpackPlugin, [{ fileName: remoteFileName }])
}

Webpack.prototype.optimization = function ({ isProduction, isEnableProfiler }) {
  this.webpackChain.optimization.minimize(isProduction)

  this.webpackChain.optimization
    .minimizer('terser')
    .use(TerserWebpackPlugin, [
      {
        terserOptions: {
          // 开启性能分析时，不要破环类名及文件名
          keep_classnames: isEnableProfiler,
          keep_fnames: isEnableProfiler,
          output: {
            comments: false,
          },
        },
        extractComments: false,
      },
    ])
    .end()

  this.webpackChain.optimization.minimizer('cssMinimizer').use(CssMinimizerWebpackPlugin).end()

  this.webpackChain.optimization.splitChunks({
    chunks: 'async',
    minSize: 20000,
    minRemainingSize: 0,
    minChunks: 1,
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    enforceSizeThreshold: 50000,
    cacheGroups: {
      framework: {
        test: (module) => {
          return /react|react-router-dom|react-dom/.test(module.context)
        },
        name: 'framework',
        enforce: true,
        reuseExistingChunk: true,
      },
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: -10,
        reuseExistingChunk: true,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  })
}

module.exports = Webpack
