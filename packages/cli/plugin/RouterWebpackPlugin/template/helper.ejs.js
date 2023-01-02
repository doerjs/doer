module.exports = `
export function noop() {}

export function firstCharToUpperCase(str) {
  return str.replace(/^\\S/, (c) => c.toUpperCase())
}

<% if (!browserHistory) { %>
export function getHashPath() {
  return window.location.hash.replace('#', '').split('?')[0] || ''
}
<% } %>

<% if (browserHistory) { %>
export function getBrowserPath() {
  return window.location.pathname
}
<% } %>

export function getRouterPath() {
  return <% if (browserHistory) { %>getBrowserPath()<% } else { %>getHashPath()<% } %>
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

export function isString(data) {
  return check(data, 'String')
}

export function isObject(data) {
  return check(data, 'Object')
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
