import path from 'node:path'
import { createRequire } from 'node:module'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import { ObjectSet } from '@doerjs/configure'
import SetupHtmlWebpackPlugin from '@doerjs/setup-html-webpack-plugin'
import LogWebpackPlugin from '@doerjs/log-webpack-plugin'
import RouterWebpackPlugin from '@doerjs/router-webpack-plugin'
import RemoteWebpackPlugin from '@doerjs/remote-webpack-plugin'
import MiniCssExtractWebpackPlugin from 'mini-css-extract-plugin'
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CompressionWebpackPlugin from 'compression-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ExternalRemotesWebpackPlugin from 'external-remotes-plugin'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import Webpackbar from 'webpackbar'
import figlet from 'figlet'
import chalk from 'chalk'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

import plugin from './plugin.js'

const { ModuleFederationPlugin } = webpack.container

const require = createRequire(import.meta.url)

function clearConsole() {
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H')
}

function getProjectLocalIdent(context, localIdentName, localName, options) {
  const { dir, name } = path.parse(context.resourcePath)
  const res = path.parse(path.resolve(dir, name))

  const hashKey =
    path.basename(context.rootContext) + path.sep + path.posix.relative(context.rootContext, context.resourcePath)
  const hash = loaderUtils.getHashDigest(hashKey, 'md5', 'base64', 5)

  return `${res.name}__${localName}--${hash}`
}

function createGetLibraryLocalIndent(libraryName) {
  return function (context, localIdentName, localName, options) {
    const { dir, name } = path.parse(context.resourcePath)
    const res = path.parse(path.resolve(dir, name))
    const prefix = libraryName ? `${libraryName}-` : ''
    return `${prefix}${res.name}__${localName}`
  }
}

function getVenderName(module) {
  const packageData = module.resourceResolveData?.descriptionFileData || {}
  if (packageData.name && packageData.version) {
    return `vender~${packageData.name.replace(/@/g, '').replace(/\//g, '-')}`
  }

  let parts = module.context.split('node_modules').filter(Boolean)
  const modulePath = parts[parts.length - 1]
  parts = modulePath.split('/').filter(Boolean)
  let name = parts[0]
  if (name.includes('@')) {
    name = [name.replace(/@/g, ''), parts[1]].join('-')
  }

  return ['vender', name.replace(/\//g, '-')].filter(Boolean).join('~')
}

class Webpack {
  remoteFileName = 'remote.js'

  get env() {
    const isProduction = process.env.NODE_ENV === 'production'
    const isEnableProfiler = isProduction && process.env.ENABLE_PROFILER === 'true'
    const isEnableGzip = process.env.GZIP === 'true'
    const isEnableAnalyzer = process.env.ENABLE_ANALYZER === 'true'
    const isFastRefresh = process.env.FAST_REFRESH === 'true'

    return {
      isProduction,
      isEnableProfiler,
      isEnableGzip,
      isEnableAnalyzer,
      isFastRefresh,
    }
  }

  constructor(context) {
    this.context = context
    this.config = new ObjectSet('webpack')
  }

  initial() {
    this.config.set('context', this.context.path.runtime)
    this.config.set('target', 'web')

    this.config.set('entry', {})
    this.config.set('entry.main', this.context.path.entry)

    this.config.set('mode', this.env.isProduction ? 'production' : 'development')
    this.config.set('watch', !this.env.isProduction)

    this.config.set('output', {
      path: this.context.path.dist,
      filename: this.env.isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: this.env.isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: process.env.PUBLIC_URL,
      assetModuleFilename: this.env.isProduction
        ? 'static/media/[name].[contenthash:8][ext]'
        : 'static/media/[name][ext]',
      uniqueName: require(this.context.path.packageJson).name,
    })

    this.config.set('resolve', {
      symlinks: true,
      alias: {},
      modules: [],
      extensions: [],
    })
    const modules = this.config.get('resolve.modules')
    modules.set('node_modules', 'node_modules')
    const extensions = this.config.get('resolve.extensions')
    extensions.set('js', '.js')
    extensions.set('jsx', '.jsx')
    extensions.set('json', '.json')

    this.config.set('module', {
      strictExportPresence: true,
      rules: [],
    })

    this.config.set('plugins', [])
    this.config.set('stats', 'none')
    this.config.set('infrastructureLogging.level', 'none')
    this.config.set('bail', this.env.isProduction)

    this.image()
    this.asset()
    this.css()
    this.cssModule()
    this.javascript()
    this.registerHtmlPlugin()
    this.registerRouterPlugin()
    this.registerRemotePlugin()
  }

  // react调试工具辅助
  reactProfiler() {
    const alias = this.config.get('resolve.alias')
    alias.set('react-dom$', 'react-dom/profiling')
    alias.set('scheduler/tracing', 'scheduler/tracing-profiling')
  }

  sourcemap() {
    this.config.set('devtool', 'cheap-module-source-map')

    this.config.set('module.rules.sourcemap', {
      test: [],
      enforce: 'pre',
      exclude: [],
      use: [],
    })

    const sourcemap = this.config.get('module.rules.sourcemap')

    sourcemap.set('test.js', /\.js$/)
    sourcemap.set('test.jsx', /\.jsx$/)

    sourcemap.set('exclude.babelRuntime', /@babel(?:\/|\\{1,2})runtime/)
    sourcemap.set('exclude.node_modules', /node_modules/)

    sourcemap.set('use.sourcemap', require.resolve('source-map-loader'))
  }

  image() {
    this.config.set('module.rules.image', {
      type: 'asset',
      test: [],
      parser: {
        dataUrlCondition: {
          maxSize: process.env.IMAGE_INLINE_LIMIT_SIZE,
        },
      },
    })

    const image = this.config.get('module.rules.image')

    image.set('test.bmp', /\.bmp$/)
    image.set('test.gif', /\.gif$/)
    image.set('test.jpg', /\.jpe?g$/)
    image.set('test.png', /\.png$/)
    image.set('test.svg', /\.svg$/)
  }

  svgr() {
    this.config.set('module.rules.svgr', {
      test: [],
      resourceQuery: /svgr/,
      use: [],
    })

    const svgr = this.config.get('module.rules.svgr')

    svgr.set('test.svg', /\.svg$/)

    svgr.set('use.svgr', {
      loader: require.resolve('@svgr/webpack'),
      options: {
        prettier: false,
        svgo: false,
        svgoConfig: {
          plugins: [{ removeViewBox: false }],
        },
        titleProp: true,
        ref: true,
      },
    })
  }

  asset() {
    this.config.set('module.rules.asset', {
      type: 'asset/resource',
      test: [],
    })

    const asset = this.config.get('module.rules.asset')

    asset.set('test.json', /\.json$/)
    asset.set('test.txt', /\.txt$/)
    asset.set('test.eot', /\.eot$/)
    asset.set('test.woff', /\.woff$/)
    asset.set('test.woff2', /\.woff2$/)
    asset.set('test.ttf', /\.ttf$/)
  }

  css() {
    this.config.set('module.rules.css', {
      test: [],
      exclude: [],
      use: [],
    })

    const css = this.config.get('module.rules.css')

    css.set('test.css', /\.css$/)

    css.set('exclude.moduleCss', /\.module\.css$/)

    css.set('use.miniCss', MiniCssExtractWebpackPlugin.loader)
    css.set('use.css', {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap: false,
      },
    })
    css.set('use.postcss', {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: false,
        postcssOptions: {
          config: false,
          plugins: [],
        },
      },
    })
    const postcss = css.get('use.postcss')
    const postcssPlugins = postcss.get('options.postcssOptions.plugins')
    postcssPlugins.set('flexBugfixes', require.resolve('postcss-flexbugs-fixes'))
    postcssPlugins.set('presetEnv', [])
    postcssPlugins.set('presetEnv.0', require.resolve('postcss-preset-env'))
    postcssPlugins.set('presetEnv.1', {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    })
    postcssPlugins.set('normalize', require.resolve('postcss-normalize'))

    this.config.set(
      'plugins.miniCss',
      {
        filename: this.env.isProduction ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
        chunkFilename: this.env.isProduction
          ? 'static/css/[name].[contenthash:8].chunk.css'
          : 'static/css/[name].chunk.css',
      },
      { type: 'ClassSet', ClassObject: MiniCssExtractWebpackPlugin },
    )
  }

  cssModule() {
    this.config.set('module.rules.cssModule', {
      test: [],
      use: [],
    })

    const cssModule = this.config.get('module.rules.cssModule')

    cssModule.set('test.cssModule', /\.module\.css$/)

    cssModule.set('use.miniCss', MiniCssExtractWebpackPlugin.loader)
    cssModule.set('use.css', {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap: false,
        modules: {
          getLocalIdent:
            this.context.config.mode === 'library'
              ? createGetLibraryLocalIndent(this.context.config.libraryName)
              : getProjectLocalIdent,
        },
      },
    })
    cssModule.set('use.postcss', {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: false,
        postcssOptions: {
          config: false,
          plugins: [],
        },
      },
    })
    const cssModulePostcss = cssModule.get('use.postcss')
    const cssModulePostcssPlugins = cssModulePostcss.get('options.postcssOptions.plugins')
    cssModulePostcssPlugins.set('flexBugfixes', require.resolve('postcss-flexbugs-fixes'))
    cssModulePostcssPlugins.set('presetEnv', [])
    cssModulePostcssPlugins.set('presetEnv.0', require.resolve('postcss-preset-env'))
    cssModulePostcssPlugins.set('presetEnv.1', {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
    })
    cssModulePostcssPlugins.set('normalize', require.resolve('postcss-normalize'))
  }

  javascript() {
    this.config.set('module.rules.javascript', {
      test: [],
      resolve: {
        fullySpecified: false,
      },
      include: this.context.config.extraBabelCompileNodeModules,
      use: [],
    })

    const javascript = this.config.get('module.rules.javascript')
    javascript.set('test.js', /\.js$/)
    javascript.set('test.jsx', /\.jsx$/)

    javascript.set('include.src', this.context.path.src)

    javascript.set('use.babel', {
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        configFile: false,
        presets: [],
        plugins: [],
        browserslistEnv: process.env.NODE_ENV,
        compact: this.env.isProduction,
        sourceMaps: true,
        inputSourceMap: true,
      },
    })

    const babel = javascript.get('use.babel')

    const babelPresets = babel.get('options.presets')
    babelPresets.set('presetEnv', [])
    babelPresets.set('presetEnv.0', require.resolve('@babel/preset-env'))
    babelPresets.set('presetEnv.1', {
      useBuiltIns: false,
      loose: false,
      debug: false,
    })
    babelPresets.set('presetReact', [])
    babelPresets.set('presetReact.0', require.resolve('@babel/preset-react'))
    babelPresets.set('presetReact.1', {
      development: !this.env.isProduction,
      runtime: 'automatic',
    })

    const babelPlugins = babel.get('options.plugins')
    babelPlugins.set('transformRuntime', [])
    babelPlugins.set('transformRuntime.0', require.resolve('@babel/plugin-transform-runtime'))
    babelPlugins.set('transformRuntime.1', {
      corejs: 3,
      helpers: true,
      regenerator: true,
    })
  }

  alias() {
    const alias = this.config.get('resolve.alias')

    // 设置脚手架对外暴露的API方法别名
    // 使用方法
    // import {} from 'doer'
    alias.set('doer', path.resolve(this.context.path.complier, 'expose.js'))

    // 设置用户自定义的别名
    Object.keys(this.context.config.alias).forEach((name) => {
      alias.set(name, path.resolve(this.context.path.runtime, this.context.config.alias[name]))
    })
  }

  registerHtmlPlugin() {
    this.config.set(
      'plugins.html',
      {
        inject: true,
        template: this.context.path.html,
        ...(this.env.isProduction
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
      { type: 'ClassSet', ClassObject: HtmlWebpackPlugin },
    )

    this.config.set(
      'plugins.setupHtml',
      {
        HtmlWebpackPlugin,
        env: this.context.env.env,
      },
      { type: 'ClassSet', ClassObject: SetupHtmlWebpackPlugin },
    )
  }

  registerDefinePlugin() {
    this.config.set('plugins.define', this.context.env.stringify(), {
      type: 'ClassSet',
      ClassObject: webpack.DefinePlugin,
    })
  }

  registerLogPlugin() {
    this.config.set('plugins.log', undefined, { type: 'ClassSet', ClassObject: LogWebpackPlugin })
  }

  registerCompressionPlugin() {
    this.config.set('plugins.compression', undefined, { type: 'ClassSet', ClassObject: CompressionWebpackPlugin })
  }

  registerBundleAnalyzerPlugin() {
    this.config.set('plugins.bundleAnalyzer', undefined, { type: 'ClassSet', ClassObject: BundleAnalyzerPlugin })
  }

  registerRouterPlugin() {
    this.config.set(
      'plugins.router',
      {
        appPackage: this.context.path.packageJson,
        appConfig: this.context.config,
        outputPath: this.context.path.complier,
        srcPath: this.context.path.src,
        publicPath: this.context.path.publicUrl,
        remoteFileName: this.remoteFileName,
        extensions: [],
      },
      { type: 'ClassSet', ClassObject: RouterWebpackPlugin },
    )

    const extensions = this.config.get('plugins.router.extensions')
    extensions.set('js', '.js')
    extensions.set('jsx', '.jsx')
  }

  registerRemotePlugin() {
    const packageData = require(this.context.path.packageJson)
    const cliPackageData = require(this.context.path.cliPackageJson)

    this.config.set(`entry.${packageData.name}`, path.resolve(this.context.path.complier, 'publicPath.js'))

    this.config.set(
      'plugins.moduleFederation',
      {
        name: packageData.name,
        filename: this.remoteFileName,
        exposes: {
          ...this.context.config.exposes,
          './$$Router': path.resolve(this.context.path.complier, 'Router.jsx'),
          './$$app': path.resolve(this.context.path.complier, 'app.js'),
        },
        shared: {
          ...this.context.config.shared,
          'react': {
            singleton: true,
            requiredVersion: cliPackageData.dependencies.react,
            strictVersion: true,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: cliPackageData.dependencies['react-dom'],
            strictVersion: true,
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: cliPackageData.dependencies['react-router-dom'],
            strictVersion: true,
          },
          'history': {
            singleton: true,
            requiredVersion: cliPackageData.dependencies.history,
            strictVersion: true,
          },
        },
      },
      { type: 'ClassSet', ClassObject: ModuleFederationPlugin },
    )

    this.config.set('plugins.externalRemotes', undefined, {
      type: 'ClassSet',
      ClassObject: ExternalRemotesWebpackPlugin,
    })

    this.config.set(
      'plugins.remote',
      {
        fileName: this.remoteFileName,
        scopeName: 'remote',
        windowScopeName: '__doer_remotes__',
      },
      { type: 'ClassSet', ClassObject: RemoteWebpackPlugin },
    )
  }

  registerWebpackbarPlugin() {
    this.config.set(
      'plugins.webpackbar',
      {
        name: 'Doer',
        color: '#08979c',
        reporter: {
          afterAllDone: () => {
            const cliPackage = require(this.context.path.cliPackageJson)
            const appPackage = require(this.context.path.packageJson)
            clearConsole()
            console.info(figlet.textSync('Doer', 'Ghost'))
            console.info(`👣 Doer v${cliPackage.version}`)
            console.info()
            console.info(`👣 应用名称：${chalk.blue(chalk.bold(appPackage.name))}`)
            console.info()
          },
        },
      },
      {
        type: 'ClassSet',
        ClassObject: Webpackbar,
      },
    )
  }

  registerReactRefreshPlugin() {
    const babel = this.config.get('module.rules.javascript.use.babel')
    const babelPlugins = babel.get('options.plugins')
    babelPlugins.set('reactRefresh', require.resolve('react-refresh/babel'))
    this.config.set(
      'plugins.reactRefresh',
      { overlay: false, exclude: [/node_modules/, /bootstrap\.js$/] },
      { type: 'ClassSet', ClassObject: ReactRefreshWebpackPlugin },
    )
  }

  optimization() {
    this.config.set('optimization', {
      minimize: this.env.isProduction,
      minimizer: [],
    })

    const optimization = this.config.get('optimization')
    const minimizer = optimization.get('minimizer')
    minimizer.set(
      'terser',
      {
        terserOptions: {
          // 开启性能分析时，不要破环类名及文件名
          keep_classnames: this.env.isEnableProfiler,
          keep_fnames: this.env.isEnableProfiler,
          output: {
            comments: false,
          },
        },
        extractComments: false,
      },
      { type: 'ClassSet', ClassObject: TerserWebpackPlugin },
    )
    minimizer.set('cssMinimizer', undefined, { type: 'ClassSet', ClassObject: CssMinimizerWebpackPlugin })

    // 第三方包打包机制
    const venderCacheGroup = {
      test: (module) => {
        return /[\\/]node_modules[\\/]/.test(module.context)
      },
      name: (module) => {
        return getVenderName(module)
      },
    }
    const cacheGroups = {}
    cacheGroups.vender = venderCacheGroup

    optimization.set('splitChunks', {
      chunks: 'async',
      minSize: 0,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: Infinity,
      maxInitialRequests: Infinity,
      enforceSizeThreshold: 50000,
      cacheGroups,
    })
  }

  build(callback) {
    // 初始化基础能力
    this.initial()
    // 添加别名能力支持
    this.alias()
    // 添加svg组件支持
    this.svgr()
    // 注册define支持
    this.registerDefinePlugin()
    // 注册log支持
    this.registerLogPlugin()
    // 注册进度条
    this.registerWebpackbarPlugin()
    // 注册打包优化
    this.optimization()

    // 添加sourcemap支持
    if (!this.env.isProduction) {
      this.sourcemap()
      this.env.isFastRefresh && this.registerReactRefreshPlugin()
    }

    // 启用react调试功能
    if (!this.env.isProduction && this.env.isEnableProfiler) {
      this.reactProfiler()
    }

    // 启用gzip
    if (this.env.isEnableGzip) {
      this.registerCompressionPlugin()
    }

    this.context.config.webpackConfigure(this.config)
    plugin.hooks.webpackConfigure.call(this.config)

    let webpackConfig = this.context.config.webpackConfig(this.config.toValue())
    webpackConfig = plugin.hooks.webpackConfig.call(webpackConfig)
    const compiler = webpack(webpackConfig, callback)

    plugin.hooks.webpack.call(compiler)

    return compiler
  }
}

export default Webpack
