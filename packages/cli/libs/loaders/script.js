'use strict'

const paths = require('../paths')

// 创建BABEL编译缓存唯一标识
function createBabelCacheIdentifier(packages) {
  const { ENV, NODE_ENV } = process.env

  const cacheIdentifier = `${ENV}:${NODE_ENV}`
  return packages.reduce((result, packageName) => {
    try {
      const packageJson = require(`${packageName}/package.json`)
      return `${result}:${packageName}@${packageJson.version}`
    } catch (_) {
      return result
    }
  }, cacheIdentifier)
}

module.exports = function script({ isProduction, appConfig }) {
  const cliPackageJson = require(paths.cliPaths.packageJsonPath)

  return [
    {
      test: /\.(js|jsx)$/,
      include: [paths.appPaths.srcPath].concat(appConfig.extraBabelCompileNodeModules || []),
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        configFile: false,
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              useBuiltIns: false,
              loose: false,
              debug: false,
            },
          ],
          require.resolve('@babel/preset-react'),
        ],
        plugins: [
          [
            require.resolve('@babel/plugin-transform-runtime'),
            {
              corejs: 3,
              helpers: true,
              regenerator: true,
            },
          ],
        ],
        browserslistEnv: process.env.NODE_ENV,
        cacheDirectory: true,
        cacheIdentifier: createBabelCacheIdentifier([
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/plugin-transform-runtime',
          cliPackageJson.name,
        ]),
        cacheCompression: true,
        compact: isProduction,
        sourceMaps: true,
        inputSourceMap: true,
      },
    },
  ]
}
