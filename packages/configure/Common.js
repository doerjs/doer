import Configure from './Configure.js'

class Common extends Configure {
  static check(value) {
    return true
  }

  static create(key, value) {
    const common = new Common(key)
    common.setValue(key, value)
    return common
  }

  setValue(_, value) {
    this.value = value
  }

  getValue() {
    return this.value
  }

  toValue() {
    return this.value
  }
}

export default Common
