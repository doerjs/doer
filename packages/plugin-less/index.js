import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default function (plugin) {
  function less(webpackConfigure) {
    const miniCss = webpackConfigure.get('module.rules.css.use.miniCss')

    webpackConfigure.set('module.rules.less', {
      test: [],
      exclude: [],
      use: [],
    })

    const less = webpackConfigure.get('module.rules.less')

    less.set('test.less', /\.less$/)

    less.set('exclude.moduleLess', /\.module\.less$/)

    less.set('use.miniCss', miniCss.toValue())
    less.set('use.css', {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap: false,
      },
    })
    less.set('use.postcss', {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: false,
        postcssOptions: {
          config: false,
          plugins: [],
        },
      },
    })
    const postcss = less.get('use.postcss')
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

    less.set('use.less', {
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: false,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    })
  }

  function lessModule(webpackConfigure) {
    const miniCss = webpackConfigure.get('module.rules.css.use.miniCss')

    webpackConfigure.set('module.rules.lessModule', {
      test: [],
      use: [],
    })

    const lessModule = webpackConfigure.get('module.rules.lessModule')

    lessModule.set('test.less', /\.module\.less$/)

    lessModule.set('use.miniCss', miniCss.toValue())
    lessModule.set('use.css', {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap: false,
      },
    })
    lessModule.set('use.postcss', {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: false,
        postcssOptions: {
          config: false,
          plugins: [],
        },
      },
    })
    const postcss = lessModule.get('use.postcss')
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

    lessModule.set('use.less', {
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: false,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    })
  }

  plugin.hooks.webpackConfigure.tap((webpackConfigure) => {
    less(webpackConfigure)
    lessModule(webpackConfigure)
  })

  plugin.hooks.webpackConfig.tap('Less', (webpackConfig) => {
    const sourceMapRule = webpackConfig.module.rules.find((rule) => {
      return rule.enforce === 'pre' && rule.use.some((item) => item.loader.includes('source-map-loader'))
    })
    if (!sourceMapRule) return
    sourceMapRule.test.push(/\.less$/)
  })
}
