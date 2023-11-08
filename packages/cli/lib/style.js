'use strict'

const MiniCssExtractWebpackPlugin = require('mini-css-extract-plugin')
const localIdent = require('@doerjs/utils/getLocalIdent')
const is = require('@doerjs/utils/is')

const context = require('../context')

module.exports = function (webpackChain, option) {
  const styleRule = webpackChain.module.rule(option.name).test(option.test).sideEffects(true)

  if (option.include) {
    option.include.forEach((data) => {
      styleRule.include.add(data)
    })
    styleRule.end()
  }

  if (option.exclude) {
    option.exclude.forEach((data) => {
      styleRule.exclude.add(data)
    })
    styleRule.end()
  }

  styleRule.use('miniCssExtract').loader(MiniCssExtractWebpackPlugin.loader).end()

  const cssOptions = {
    importLoaders: 2,
    sourceMap: true,
  }
  if (option.cssModule) {
    cssOptions.modules = {
      getLocalIdent:
        context.config.config.mode === 'library'
          ? localIdent.createGetLibraryLocalIndent(context.config.config.libraryName)
          : localIdent.getProjectLocalIdent,
    }
  }
  styleRule.use('css').loader(require.resolve('css-loader')).options(cssOptions).end()

  styleRule
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

  if (is.isArray(option.loaders)) {
    option.loaders.forEach((item) => {
      styleRule.use(item.name).loader(item.loader).options(item.options).end()
    })
  }

  styleRule.end()
}
