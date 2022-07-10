module.exports = function (webpackChain, option) {
  const babelRule = webpackChain.module.rule(option.name).test(option.test)

  if (option.include) {
    option.include.forEach((data) => {
      babelRule.include.add(data)
    })
    babelRule.end()
  }

  if (option.exclude) {
    option.exclude.forEach((data) => {
      babelRule.exclude.add(data)
    })
    babelRule.end()
  }

  babelRule
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
      ].concat(option.presets || []),
      plugins: [
        [
          require.resolve('@babel/plugin-transform-runtime'),
          {
            corejs: 3,
            helpers: true,
            regenerator: true,
          },
        ],
      ].concat(option.plugins || []),
      browserslistEnv: process.env.NODE_ENV,
      compact: process.env.NODE_ENV === 'production',
      sourceMaps: true,
      inputSourceMap: true,
    })
    .end()

  babelRule.end()
}
