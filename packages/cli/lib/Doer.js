import Context from '@doerjs/context'

import plugin from './plugin.js'
import Tap from './Tap.js'
import TapStream from './TapStream.js'
import Webpack from './Webpack.js'
import WebpackDevServer from './WebpackDevServer.js'

class Doer {
  constructor() {
    this.context = Context.create()
  }

  async initial() {
    // 获取上下文的勾子方法
    // 包含环境配置env、脚手架配置config、脚手架相关路径path
    plugin.register('context', new Tap(['context']))

    // webpack配置器设置勾子方法
    plugin.register('webpackConfigure', new Tap(['webpackConfigure']))

    // webpack配置设置勾子方法
    plugin.register('webpackConfig', new TapStream(['webpackConfig']))

    // webpack complier准备完成勾子方法
    plugin.register('webpack', new Tap(['complier']))

    // webpack dev server配置器设置勾子方法
    plugin.register('webpackDevServerConfigure', new Tap(['webpackDevServerConfigure']))

    // webpack dev server配置设置勾子方法
    plugin.register('webpackDevServerConfig', new TapStream(['webpackDevServerConfig']))

    // server创建完成勾子方法
    plugin.register('webpackDevServer', new Tap(['webpackDevServer']))

    await this.context.parse()
    await this.plugins()
    plugin.hooks.context.call(this.context)
  }

  async plugins() {
    const plugins = this.context.config.plugins
    if (!plugins.length) {
      return
    }

    for (let i = 0; i < plugins.length; i++) {
      const item = plugins[i]
      const handle = await import(item.path).then((module) => module.default)
      handle(plugin, item.option)
    }
  }

  async dev() {
    await this.initial()

    const webpack = new Webpack(this.context)
    const complier = webpack.build((err) => {
      if (err) {
        console.error(err)
      }
    })
    new WebpackDevServer(this.context).run(complier)
  }

  async build() {
    await this.initial()

    const webpack = new Webpack(this.context)
    const complier = webpack.build()
    complier.run((err) => {
      if (err) {
        console.error(err)
      }
    })
  }
}

export default Doer
