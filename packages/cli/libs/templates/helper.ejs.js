module.exports = `
export function getLayoutName() {
  const [layoutName = ''] = window.location.hash.replace('#', '').split('/').filter(item => item)
  return layoutName
}

export function firstCharToUpperCase(str) {
  return str.replace(/^\\S/, (c) => c.toUpperCase())
}

function check(data, type) {
  return Object.prototype.toString.call(data) === \`[object \${type}]\`
}

export function isFunction(data) {
  return check(data, 'Function')
}
`
