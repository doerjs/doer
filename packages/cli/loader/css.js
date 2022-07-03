'use strict'

const MiniCssExtractWebpackPlugin = require('mini-css-extract-plugin')
const getLocalIdent = require('@doerjs/utils/getLocalIdent')

module.exports = function cssLoader(webpack, option) {
  webpack.webpackChain.module
    .rule('css')
    .test(/\.css$/)
    .exclude.add(/\.module\.css$/)
    .end()
    .sideEffects(true)

    .use('miniCssExtract')
    .loader(MiniCssExtractWebpackPlugin.loader)
    .end()

    .use('css')
    .loader(require.resolve('css-loader'))
    .options({
      importLoaders: 2,
      sourceMap: true,
    })
    .end()

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

    .end()

  webpack.webpackChain.module
    .rule('cssModule')
    .test(/\.module\.css$/)
    .sideEffects(true)

    .use('miniCssExtract')
    .loader(MiniCssExtractWebpackPlugin.loader)
    .end()

    .use('css')
    .loader(require.resolve('css-loader'))
    .options({
      importLoaders: 2,
      sourceMap: true,
      modules: {
        getLocalIdent,
      },
    })
    .end()

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

    .end()
}
