'use strict'

const chokidar = require('chokidar')

const ReactRouter = require('./ReactRouter')

class RouterWebpackPlugin {
  constructor(options) {
    this.options = options
    this.router = new ReactRouter(options)
  }

  apply(compiler) {
    compiler.hooks.initialize.tap('RouterWebpackPlugin', () => {
      this.router.initialize()
    })

    if (process.env.NODE_ENV === 'development') {
      const watcher = chokidar.watch(this.options.srcPath, {
        ignoreInitial: true,
      })

      watcher
        .on('add', this.onCreate.bind(this))
        .on('unlink', this.onRemove.bind(this))
        .on('change', this.onChange.bind(this))
        .on('error', this.onError.bind(this))
    }
  }

  onCreate(filePath) {
    this.router.create(filePath)
  }

  onRemove(filePath) {
    this.router.remove(filePath)
  }

  onChange(filePath) {
    this.router.change(filePath)
  }

  onError(filePath) {
    // no action
  }
}

module.exports = RouterWebpackPlugin
