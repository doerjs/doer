module.exports = `
export function noop() {}

export function firstCharToUpperCase(str) {
  return str.replace(/^\\S/, (c) => c.toUpperCase())
}

function check(data, type) {
  return Object.prototype.toString.call(data) === \`[object \${type}]\`
}

export function isFunction(data) {
  return check(data, 'Function')
}

export function isUndefined(data) {
  return check(data, 'Undefined')
}

function debug() {
  return new URLSearchParams(window.location.search).get('debug')
}

// 此模式下可编辑且生效
export function isDebug() {
  return debug() === 'true' && process.env.NODE_ENV === 'development'
}

// 当前模式仅编辑，但不生效
export function isEnableEditDebug() {
  return debug() === '' && process.env.NODE_ENV === 'development'
}
`
