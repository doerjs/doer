const is = require('@doerjs/utils/is')

class RemoteWebpackPlugin {
  /**
   * options
   *  include 包含的目录
   *  exclude 排除的目录
   */
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.make.tap('RemoteWebpackPlugin', (compilation) => {
      compilation.hooks.succeedModule.tap('RemoteWebpackPlugin', (module) => {
        if (!this.isInclude(module) || this.isExclude(module)) {
          // TODO
        }
      })
    })
  }

  isInclude(module) {
    if (!module.userRequest) return false

    if (is.isString(this.options.include)) {
      return module.userRequest.indexOf(this.options.include) === 0
    }

    if (is.isArray(this.options.include)) {
      return this.options.include.some((include) => {
        return module.userRequest.indexOf(this.options.include) === 0
      })
    }

    return false
  }

  isExclude(module) {
    if (!module.userRequest) return false

    if (is.isString(this.options.exclude)) {
      return module.userRequest.indexOf(this.options.include) === 0
    }

    if (is.isArray(this.options.exclude)) {
      return this.options.exclude.some((exclude) => {
        return module.userRequest.indexOf(this.options.exclude) === 0
      })
    }

    return false
  }
}

module.exports = RemoteWebpackPlugin
