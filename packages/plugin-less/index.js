module.exports = function (plugin, option) {
  plugin.hooks.webpack.tap('Less', (webpackChain) => {
    plugin.style(webpackChain, {
      name: 'less',
      test: /\.less$/,
      exclude: [/\.module\.less$/],
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: true,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    })

    plugin.style(webpackChain, {
      name: 'lessModule',
      test: /\.module\.less$/,
      loader: require.resolve('less-loader'),
      cssModule: true,
      options: {
        sourceMap: true,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    })
  })
}
