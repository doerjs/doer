'use strict'

module.exports = function svgLoader(webpack, option) {
  const svgRule = webpack.webpackChain.module.rule('svg').test(/\.svg$/)

  svgRule
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

  svgRule
    .use('resource')
    .loader(require.resolve('file-loader'))
    .options({
      name: option.assetModuleFilename,
    })
    .end()

  svgRule.end()
}
