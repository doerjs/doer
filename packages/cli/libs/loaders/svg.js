'use strict'

module.exports = function svgLoader({ assetModuleFilename }) {
  return [
    {
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve('@svgr/webpack'),
          options: {
            prettier: false,
            svgo: false,
            svgoConfig: {
              plugins: [{ removeViewBox: false }],
            },
            titleProp: true,
            ref: true,
          },
        },
        {
          loader: require.resolve('file-loader'),
          options: {
            name: assetModuleFilename,
          },
        },
      ],
      issuer: {
        and: [/\.(js|jsx|md|mdx)$/],
      },
    },
  ]
}
