import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default function (plugin) {
  function less(webpackConfigure) {
    const css = webpackConfigure.get('module.rules.css')
    webpackConfigure.set('module.rules.less', {
      test: [],
      exclude: [],
      use: [],
    })
    const less = webpackConfigure.get('module.rules.less')
    less.set('test.less', /\.less$/)
    less.set('exclude.moduleLess', /\.module\.less$/)
    less.set('use.miniCss', css.get('use.miniCss').toValue())
    less.set('use.css', css.get('use.css').toValue())
    less.set('use.postcss', css.get('use.postcss').toValue())
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
    const cssModule = webpackConfigure.get('module.rules.cssModule')
    webpackConfigure.set('module.rules.lessModule', {
      test: [],
      use: [],
    })

    const lessModule = webpackConfigure.get('module.rules.lessModule')
    lessModule.set('test.less', /\.module\.less$/)
    lessModule.set('use.miniCss', cssModule.get('use.miniCss').toValue())
    lessModule.set('use.css', cssModule.get('use.css'))
    lessModule.set('use.postcss', cssModule.get('use.postcss'))
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
