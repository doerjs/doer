'use strict'

const MiniCssExtractWebpackPlugin = require('mini-css-extract-plugin')
const getLocalIdent = require('@doerjs/utils/getLocalIdent')

module.exports = function (webpackChain, option) {
  const chain = webpackChain.module.rule(option.name).test(option.test)

  if (option.include) {
    option.include.forEach((data) => {
      chain.include.add(data)
    })
    chain.end()
  }

  if (option.exclude) {
    option.exclude.forEach((data) => {
      chain.exclude.add(data)
    })
    chain.end()
  }

  chain.sideEffects(true)
  chain.use('miniCssExtract').loader(MiniCssExtractWebpackPlugin.loader).end()

  const cssOptions = {
    importLoaders: 2,
    sourceMap: true,
  }
  if (option.cssModule) {
    cssOptions.modules = {
      getLocalIdent,
    }
  }
  chain.use('css').loader(require.resolve('css-loader')).options(cssOptions).end()

  chain
    .use('postcss')
    .loader(require.resolve('postcss-loader'))
    .options({
      sourceMap: true,
      postcssOptions: {
        config: false,
        plugins: [
          // 修正postcss flex布局转换bug
          require.resolve('postcss-flexbugs-fixes'),
          [
            require.resolve('postcss-preset-env'),
            {
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            },
          ],
          require.resolve('postcss-normalize'),
        ],
      },
    })
    .end()

  chain.use('pre').loader(option.loader).options(option.options)

  chain.end()
}
