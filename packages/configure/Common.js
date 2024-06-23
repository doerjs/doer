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

  cloneValue() {
    const common = new Common(this.key)
    common.setValue(undefined, this.value)
    return common
  }
}

export default Common
