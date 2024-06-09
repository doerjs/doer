function check(data, type) {
  return Object.prototype.toString.call(data) === `[object ${type}]`
}

export function isUndefined(data) {
  return check(data, 'Undefined')
}

export function isNull(data) {
  return check(data, 'Null')
}

export function isString(data) {
  return check(data, 'String')
}

export function isFunction(data) {
  return check(data, 'Function')
}

export function isObject(data) {
  return check(data, 'Object')
}

// 是否是字面量对象
export function isLiteObject(data) {
  return data && data.constructor === Object
}

export function isNumber(data) {
  return check(data, 'Number')
}

export function isRegExp(data) {
  return check(data, 'RegExp')
}

export function isArray(data) {
  return check(data, 'Array')
}

export function isDate(data) {
  return check(data, 'Date')
}

export function isBoolean(data) {
  return check(data, 'Boolean')
}

export function isEnum(enums = []) {
  return function (data) {
    if (isArray(enums)) {
      return enums.some((item) => item === data)
    }
    return false
  }
}
