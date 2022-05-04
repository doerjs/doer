module.exports = `
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
`
