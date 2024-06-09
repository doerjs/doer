import Tap from './Tap.js'
import TapStream from './TapStream.js'

class Plugin {
  hooks = {}

  register(keys, instance) {
    const namePath = keys.split('.').filter(Boolean)
    if (!namePath.length) {
      return
    }

    const keyPath = namePath.slice(0, namePath.length - 1)
    const name = namePath[namePath.length - 1]

    let next = this.hooks
    keyPath.forEach((key) => {
      if (!next[key]) {
        next[key] = {}
      } else if (next[key] instanceof Tap || next[key] instanceof TapStream) {
        throw new Error('存在无效的插件注册方法，请检查对应插件的plugin.register方法')
      }
      next = next[key]
    })

    next[name] = instance
  }
}

export default new Plugin()
