import * as is from '@doerjs/utils/is.js'

class Tap {
  constructor(names = []) {
    this.events = []
    this.names = names
  }

  tap(handle) {
    if (!is.isFunction(handle)) {
      return
    }

    this.events.push(handle)
  }

  call(...rest) {
    this.events.forEach((handle) => {
      handle(...rest.slice(0, this.names.length))
    })
  }
}

export default Tap
