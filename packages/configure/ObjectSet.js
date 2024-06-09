import * as is from '@doerjs/utils/is.js'

import Configure from './Configure.js'

class ObjectSet extends Configure {
  constructor(key) {
    super(key)
    this.value = {}
  }

  static check(value) {
    return is.isLiteObject(value)
  }

  static create(key, value) {
    const object = new ObjectSet(key)
    Object.keys(value).forEach((name) => {
      object.set(name.replace(/\./g, '\\.'), Configure.into(name, value[name]))
    })

    return object
  }

  getValue(key) {
    return this.value[key]
  }

  setValue(key, value) {
    this.value[key] = value
  }

  toValue() {
    return Object.keys(this.value).reduce((result, key) => {
      const value = this.value[key].toValue()
      if (!is.isUndefined(value)) {
        result[key] = value
      }
      return result
    }, {})
  }
}

export default ObjectSet
