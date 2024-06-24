import Configure from './Configure.js'

class ClassSet extends Configure {
  constructor(key, option) {
    super(key)
    this.option = option || {}
  }

  static check(value, option = {}) {
    return option.type === 'ClassSet'
  }

  static create(key, value, option = {}) {
    const classSet = new ClassSet(key, option)
    classSet.value = Configure.into(key, value)
    return classSet
  }

  getValue(key) {
    return this.value.getValue(key)
  }

  setValue(key, value) {
    this.value.setValue(key, value)
  }

  cloneValue() {
    const classSet = new ClassSet(this.key, this.option)
    classSet.value = this.value.cloneValue()
    return classSet
  }

  toValue() {
    const { ClassObject } = this.option
    return new ClassObject(this.value.toValue())
  }
}

export default ClassSet
