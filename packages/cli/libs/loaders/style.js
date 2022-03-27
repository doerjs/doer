'use strict'

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const loaderUtils = require('loader-utils')

function getLocalIdent(context, localIdentName, localName, options) {
  const { dir, name } = path.parse(context.resourcePath)
  const res = path.parse(path.resolve(dir, name))

  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    'md5',
    'base64',
    5,
  )

  return `${res.name}__${localName}--${hash}`
}

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
              getLocalIdent,
            }
          : undefined,
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
