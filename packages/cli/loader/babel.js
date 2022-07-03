'use strict'

module.exports = function jsLoader(webpack, option) {
  webpack.webpackChain.module
    .rule('babel')
    .test([/\.js$/, /\.jsx$/])
    .include.add(webpack.paths.appPaths.srcPath)
    .merge(webpack.config.config.extraBabelCompileNodeModules)
    .end()

    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options({
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
      compact: option.isProduction,
      sourceMaps: true,
      inputSourceMap: true,
    })
    .end()

    .end()
}
