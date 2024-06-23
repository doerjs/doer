// eslint-disable-next-line camelcase
function should_implemented_by_children(instance) {
  throw new Error(`Class ${instance.constructor.name} of abstract method should be implemented by children class.`)
}

class Configure {
  // 解析器
  static parsers = []

  // 配置项唯一健
  key = ''

  constructor(key) {
    this.key = key
  }

  static register(Parser) {
    Configure.parsers.push(Parser)
  }

  static into(key, value, option) {
    if (value instanceof Configure) {
      return value
    }

    const Parser = Configure.parsers
      .slice()
      .reverse()
      .find((Parser) => Parser.check(value, option))
    if (Parser) {
      return Parser.create(key, value, option)
    }
  }

  static encodeKey(key) {
    return key.replace(/\\\./g, '&nbsp;')
  }

  static decodeKey(key) {
    return key.replace(/&nbsp;/g, '.')
  }

  splitKeyPath(keyPath) {
    return Configure.encodeKey(keyPath)
      .split('.')
      .filter(Boolean)
      .map((key) => {
        return Configure.decodeKey(key)
      })
  }

  // 获取配置项
  get(keyPath) {
    if (!keyPath) {
      return
    }

    const keys = this.splitKeyPath(keyPath)
    let current = this
    let key = keys.shift()
    while (current && key) {
      current = current.getValue(key)
      key = keys.shift()
    }

    return current
  }

  // 设置配置项
  set(keyPath, value, option) {
    if (!keyPath) {
      return
    }

    const keys = this.splitKeyPath(keyPath)
    const parentKeys = keys.slice(0, keys.length - 1)
    let current = this
    for (let i = 0; i < parentKeys.length; i++) {
      const key = parentKeys[i]
      const next = current.getValue(key)

      if (next) {
        current = next
        continue
      }

      // 中间路径在值不存在时，属于没有提前声明类型的
      // 默认按对象类型处理
      current.setValue(key, Configure.into(key, {}))
      current = current.getValue(key)
    }

    const key = keys[keys.length - 1]
    current.setValue(key, Configure.into(key, value, option))
  }

  // 深度拷贝
  clone() {
    return this.cloneValue()
  }

  // 检测数据类型是否符合该对象标准
  // 符合该对象标准则执行该对象的parse方法
  static check() {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }

  // 该对象对数据的加工处理方法
  static create(value) {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }

  getValue(key) {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }

  setValue(key, value) {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }

  cloneValue() {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }

  // 转换为常规json配置
  toValue() {
    // no action 需要子元素去实现
    should_implemented_by_children(this)
  }
}

export default Configure
