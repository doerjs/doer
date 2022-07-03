'use strict'

module.exports = function svgLoader(webpack, option) {
  webpack.webpackChain.module
    .rule('svg')
    .test(/\.svg$/)

    .use('svgr')
    .loader(require.resolve('@svgr/webpack'))
    .options({
      prettier: false,
      svgo: false,
      svgoConfig: {
        plugins: [{ removeViewBox: false }],
      },
      titleProp: true,
      ref: true,
    })
    .end()

    .use('resource')
    .loader(require.resolve('file-loader'))
    .options({
      name: option.assetModuleFilename,
    })
    .end()

    .end()
}
