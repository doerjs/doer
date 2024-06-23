import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default function (plugin) {
  function less(webpackConfigure) {
    webpackConfigure.set('module.rules.less', {
      test: [],
      exclude: [],
      use: webpackConfigure.get('module.rules.css.use').clone(),
    })
    const less = webpackConfigure.get('module.rules.less')
    less.set('test.less', /\.less$/)
    less.set('exclude.moduleLess', /\.module\.less$/)
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
    webpackConfigure.set('module.rules.lessModule', {
      test: [],
      use: webpackConfigure.get('module.rules.cssModule.use').clone(),
    })
    const lessModule = webpackConfigure.get('module.rules.lessModule')
    lessModule.set('test.less', /\.module\.less$/)
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
