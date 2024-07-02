import chokidar from 'chokidar'
import * as file from '@doerjs/utils/file.js'

import Context from '../context/Context.js'
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

    // 遍历文件的勾子
    plugin.register('eachFile', new Tap(['filePath']))

    // 遍历文件结束
    plugin.register('eachFileEnd', new Tap())

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

    // 文件监听器勾子方法
    plugin.register('watcher', new Tap(['watcher']))

    // 插件配置勾子方法
    plugin.register('plugin', new TapStream(['plugin']))

    await this.context.parse()
    await this.plugins()
    plugin.hooks.context.call(this.context)

    // 遍历所有的文件
    file.eachFile(this.context.path.src, (filePath) => {
      plugin.hooks.eachFile.call(filePath)
    })
    plugin.hooks.eachFileEnd.call()

    if (process.env.NODE_ENV === 'development') {
      const configFiles = [
        this.context.path.config,
        `${this.context.path.env}.${process.env.ENV}.local`,
        `${this.context.path.env}.${process.env.ENV}`,
        `${this.context.path.env}.local`,
        this.context.path.env,
      ]
      function ensureRestart(filePath) {
        if (configFiles.includes(filePath)) {
          plugin.restart()
        }
      }

      const watcher = chokidar.watch([this.context.path.src].concat(configFiles), {
        ignored: [this.context.path.prodComplier, this.context.path.devComplierPath],
        ignoreInitial: true,
      })
      watcher.on('add', ensureRestart).on('change', ensureRestart).on('unlink', ensureRestart)
      plugin.hooks.watcher.call(watcher)
    }
  }

  async plugins() {
    const routerPlugin = {
      path: '@doerjs/plugin-router',
      option: { extensions: ['.js', '.jsx'] },
    }

    const plugins = [routerPlugin].concat(this.context.config.plugins)
    if (!plugins.length) {
      return
    }

    for (let i = 0; i < plugins.length; i++) {
      const result = plugin.hooks.plugin.call(plugins[i])
      const handle = await import(result.path).then((module) => module.default)
      handle(plugin, result.option)
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
