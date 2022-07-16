'use strict'

module.exports = function (plugin, option) {
  plugin.hooks.environment.tap('Typescript', (environment) => {
    plugin.hooks.webpack.tap('Typescript', (webpackChain) => {
      plugin.registerBabelLoader(webpackChain, {
        name: 'typescript',
        test: [/\.ts$/, /\.tsx$/],
        include: [environment.paths.appPaths.srcPath],
        exclude: [/\.d\.ts$/],
        presets: ['@babel/preset-typescript'],
      })

      const extensions = ['.ts', '.tsx']
      const webpackExtensions = webpackChain.resolve.extensions
      extensions.forEach((ext) => {
        webpackExtensions.add(ext)
      })
      webpackExtensions.end()

      webpackChain.plugin('router').tap((args) => {
        return args.map((arg) => {
          arg.extensions = arg.extensions ? extensions.concat(arg.extensions) : extensions
          return arg
        })
      })
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
