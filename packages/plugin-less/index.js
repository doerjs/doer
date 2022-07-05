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
}
