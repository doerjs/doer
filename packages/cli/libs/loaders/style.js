'use strict'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

function getLessStyleLoaders({ isProduction, isModule, appConfig }) {
  const loaders = [
    // 用于将样式文件通过style标签挂载
    MiniCssExtractPlugin.loader,
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        sourceMap: true,
        modules: isModule
          ? {
              mode: 'icss',
              localIdentName: '[name]__[local]--[hash]',
            }
          : {
              mode: 'local',
            },
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: true,
        postcssOptions: {
          config: false,
          plugins: [
            // 修正postcss flex布局转换bug
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              },
            ],
            'postcss-normalize',
          ],
        },
      },
    },
    {
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: true,
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: appConfig.themes || {},
        },
      },
    },
  ]

  return loaders
}

module.exports = function style({ isProduction, appConfig }) {
  return [
    {
      test: /\.less$/,
      exclude: /\.module\.less$/,
      use: getLessStyleLoaders({ isProduction, appConfig }),
      sideEffects: true,
    },
    {
      test: /\.module\.less$/,
      use: getLessStyleLoaders({ isProduction, isModule: true, appConfig }),
      sideEffects: true,
    },
  ]
}
