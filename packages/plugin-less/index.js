'use strict'

module.exports = function (plugin, option) {
  plugin.hooks.webpack.tap('Less', (webpackChain) => {
    plugin.registerStyleLoader(webpackChain, {
      name: 'less',
      test: /\.less$/,
      exclude: [/\.module\.less$/],
      loaders: [
        {
          name: 'less',
          loader: require.resolve('less-loader'),
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    })

    plugin.registerStyleLoader(webpackChain, {
      name: 'lessModule',
      test: /\.module\.less$/,
      cssModule: true,
      loaders: [
        {
          name: 'less',
          loader: require.resolve('less-loader'),
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true,
            },
          },
        },
      ],
    })
  })

  plugin.hooks.webpackConfig.tap('Less', (webpackConfig) => {
    const sourceMapRule = webpackConfig.module.rules.find((rule) => {
      return rule.enforce === 'pre' && rule.use.some((item) => item.loader.includes('source-map-loader'))
    })
    if (!sourceMapRule) return
    sourceMapRule.test.push(/\.less$/)
  })
}
