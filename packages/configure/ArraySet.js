import * as is from '@doerjs/utils/is.js'

import Configure from './Configure.js'

class ArraySet extends Configure {
  constructor(key) {
    super(key)
    this.value = []
  }

  static check(value) {
    return is.isArray(value)
  }

  static create(key, value) {
    const array = new ArraySet(key)
    value.forEach((item, index) => {
      array.setValue(index, Configure.into(index, item))
    })

    return array
  }

  getValue(key) {
    return this.value.find((item) => item.key === key)
  }

  setValue(key, value) {
    const index = this.value.findIndex((item) => item.key === key)
    if (index === -1) {
      this.value.push(value)
    } else {
      this.value[index] = value
    }
  }

  toValue() {
    return this.value
      .map((item) => {
        return item.toValue()
      })
      .filter(Boolean)
  }
}

export default ArraySet
