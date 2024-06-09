import * as is from '@doerjs/utils/is.js'

class TapStream {
  constructor() {
    this.events = []
  }

  tap(handle) {
    if (!is.isFunction(handle)) {
      return
    }

    this.events.push(handle)
  }

  call(param) {
    let next = param
    for (let i = 0; i < this.events.length; i++) {
      const handle = this.events[i]
      const result = handle(next)

      if (is.isUndefined(result)) {
        return
      }

      next = result
    }

    return next
  }
}

export default TapStream
