'use strict'

const webpack = require('webpack')
const crypto = require('crypto')
const path = require('path')

const TerserWebpackPlugin = require('terser-webpack-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ExternalRemotesWebpackPlugin = require('external-remotes-plugin')

const ReplaceHtmlEnvWebpackPlugin = require('./plugins/ReplaceHtmlEnvWebpackPlugin')
const DoerWebpackPlugin = require('./plugins/DoerWebpackPlugin')
const LogWebpackPlugin = require('./plugins/LogWebpackPlugin')
const RemoteWebpackPlugin = require('./plugins/RemoteWebpackPlugin')

const paths = require('./paths')
const env = require('./env').getEnv(paths)
const constant = require('./constant')
const shared = require('./shared')

const scriptLoader = require('./loaders/script')
const styleLoader = require('./loaders/style')
const svgLoader = require('./loaders/svg')

const { ModuleFederationPlugin } = webpack.container

// 创建webpack缓存版本号
function createWebpackCacheVersion() {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(env.raw))

  return hash.digest('hex')
}

function getComplierTempPathName() {
  const isProduction = process.env.NODE_ENV === 'production'

  return isProduction ? '.doer.prod' : '.doer'
}

// 编译临时目录
function getComplierTempPath() {
  return path.resolve(paths.cliPaths.runtimePath, `src/${getComplierTempPathName()}`)
}

// 获取模块共享配置
function getModuleFederationConfig({ appConfig, appPackageJson }) {
  const compilerTempPathName = getComplierTempPathName()

  return {
    name: appPackageJson.name,
    filename: constant.REMOTE_SCRIPT_NAME,
    exposes: {
      ...appConfig.exposes,
      './$$Router': `./src/${compilerTempPathName}/Router`,
    },
    shared: {
      ...appConfig.shared,
      ...shared,
    },
  }
}

function createConfig(appConfig) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isEnableProfiler = isProduction && process.env.ENABLE_PROFILER === 'true'
  const isEnableGzip = isProduction && process.env.GZIP === 'true'
  const isEnableAnalyzer = isProduction && process.env.ENABLE_ANALYZER === 'true'
  const imageInlineLimitSize = parseInt(process.env.IMAGE_INLINE_LIMIT_SIZE)
  const assetModuleFilename = isProduction ? 'static/media/[name].[contenthash:8].[ext]' : 'static/media/[name].[ext]'
  const appPackageJson = require(paths.appPaths.packageJsonPath)

  const compilerTempPath = getComplierTempPath()

  return {
    mode: isProduction ? 'production' : 'development',
    // 生产环境下当编译出现出现错误时，立刻停止编译，而不是继续打包
    bail: isProduction,
    entry: {
      main: path.resolve(compilerTempPath, 'index.js'),
      [appPackageJson.name]: path.resolve(compilerTempPath, 'publicPath.js'),
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',

    // 打包输出相关配置
    output: {
      path: paths.appPaths.buildPath,
      pathinfo: !isProduction,
      // 主包模块的打包命名规则
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/main.js',
      // 分包模块的打包命名规则
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      // 资源模块的打包命名规则，如字体图标、图片等
      assetModuleFilename,
      publicPath: paths.appPaths.getPublicUrlPath(),
      uniqueName: appPackageJson.name,
    },

    // 设置webpack缓存到文件系统中
    cache: {
      type: 'filesystem',
      version: createWebpackCacheVersion(),
      // 编译闲置时将缓存放到文件系统中
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
      },
    },

    // 资源压缩，分包相关配置
    optimization: {
      minimize: isProduction,
      minimizer: [
        // 压缩JS脚本
        new TerserWebpackPlugin({
          terserOptions: {
            // 开启性能分析时，不要破环类名及文件名
            keep_classnames: isEnableProfiler,
            keep_fnames: isEnableProfiler,
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        // 压缩css样式
        new CssMinimizerWebpackPlugin(),
      ],
      splitChunks: {
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
      },
    },

    resolve: {
      alias: {
        // 搭配react-devtool执行性能分析
        ...(isEnableProfiler && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        }),
        // 设置应用程序别名
        ...appConfig.alias,
        '@doerjs/router': path.resolve(getComplierTempPath(), './history.js'),
      },
      symlinks: true,
      modules: [paths.cliPaths.nodeModulesPath, paths.appPaths.nodeModulesPath],
      // 自动解析的扩展名
      extensions: ['.js', '.jsx', '.json'],
    },

    module: {
      // 将缺失的导出提示成错误而不是警告
      strictExportPresence: true,
      rules: [
        {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|jsx|css)$/,
          loader: require.resolve('source-map-loader'),
        },
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineLimitSize,
                },
              },
            },
            ...svgLoader({ assetModuleFilename }),
            ...scriptLoader({ isProduction, appConfig }),
            ...styleLoader({ isProduction, appConfig }),
            {
              exclude: [/^$/, /\.(js|jsx)$/, /\.html$/, /\.json$/],
              type: 'asset/resource',
            },
          ],
        },
      ].filter(Boolean),
    },

    plugins: [
      // 生成html入口文件
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(paths.appPaths.publicDirectory, 'index.html'),
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
      }),

      // html入口文件支持EJS模版语法，默认注入环境变量
      new ReplaceHtmlEnvWebpackPlugin(HtmlWebpackPlugin, env.raw),
      // 向应用中注入环境变量，方便在JS中使用
      new webpack.DefinePlugin(env.stringified),

      // 提取样式为独立文件
      new MiniCssExtractPlugin({
        filename: isProduction ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
        chunkFilename: isProduction ? 'static/css/[name].[contenthash:8].chunk.css' : 'static/css/[name].chunk.css',
      }),

      // 提取公共资源路径，用于服务端生成html或者微前端资源注入读取
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
        publicPath: paths.appPaths.getPublicUrlPath(),
        generate: (seed, files, entryPoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path
            return manifest
          }, seed)
          const entryPointFiles = entryPoints.main.filter((fileName) => !fileName.endsWith('.map'))

          return {
            files: manifestFiles,
            entryPoints: entryPointFiles,
          }
        },
      }),

      // 忽略moment国际化语言包
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),

      // 项目之间实现资源共享
      new ModuleFederationPlugin(
        getModuleFederationConfig({
          appConfig,
          appPackageJson,
        }),
      ),
      new ExternalRemotesWebpackPlugin(),

      // 自动注入，生成路由系统
      new DoerWebpackPlugin({
        appConfig,
        outputPath: getComplierTempPath(),
        srcPath: paths.appPaths.srcPath,
        publicPath: paths.appPaths.getRemotePublicUrlPath(),
      }),
      // 支持直接引入远程应用模块
      new RemoteWebpackPlugin({
        fileName: constant.REMOTE_SCRIPT_NAME,
      }),

      // 自定义编译进度显示和日志打印
      new LogWebpackPlugin(),

      // 开启gzip压缩
      isEnableGzip && new CompressionWebpackPlugin(),

      // 开启打包大小分析工具
      isEnableAnalyzer && new BundleAnalyzerPlugin(),

      isProduction && new CleanWebpackPlugin(),
    ].filter(Boolean),

    // 通过自定义日志输出插件输出日志
    stats: 'none',
    infrastructureLogging: {
      level: 'none',
    },
  }
}

function createCompiler({ appConfig }) {
  const compiler = webpack(createConfig(appConfig))
  return compiler
}

module.exports = {
  createCompiler,
}
