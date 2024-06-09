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
    classSet.setValue(undefined, Configure.into(undefined, value))
    return classSet
  }

  getValue(key) {
    return this.value.getValue(key)
  }

  setValue(_, value) {
    this.value = value
  }

  toValue() {
    const { ClassObject, multiple } = this.option

    if (multiple) {
      return new ClassObject(...this.value.toValue())
    }

    return new ClassObject(this.value.toValue())
  }
}

export default ClassSet
