'use strict'

module.exports = function (plugin, option) {
  plugin.hooks.environment.tap('Typescript', (environment) => {
    plugin.hooks.webpack.tap('Typescript', (webpackChain) => {
      plugin.registerBabelLoader(webpackChain, {
        name: 'typescript',
        test: [/\.ts$/, /\.tsx$/],
        include: [environment.paths.appPaths.srcPath],
        presets: ['@babel/preset-typescript'],
      })

      webpackChain.resolve.extensions.add('.ts').add('.tsx').end()
    })

    plugin.hooks.webpackConfig.tap('Typescript', (webpackConfig) => {
      const sourceMapRule = webpackConfig.module.rules.find((rule) => {
        return rule.enforce === 'pre' && rule.use.some((item) => item.loader.includes('source-map-loader'))
      })
      if (!sourceMapRule) return

      sourceMapRule.test.push(/\.ts$/)
      sourceMapRule.test.push(/\.tsx$/)
    })
  })
}
