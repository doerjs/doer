export function setString(name, defaultValue) {
  const value = process.env[name]
  if (value) {
    return
  }
  process.env[name] = defaultValue
}

export function setBoolean(name, defaultValue) {
  const value = process.env[name]
  if (value === 'true') {
    process.env[name] = true
    return
  }

  if (value === 'false') {
    process.env[name] = false
    return
  }

  process.env[name] = defaultValue
}

export function setNumber(name, defaultValue) {
  const value = process.env[name]
  if (value) {
    process.env[name] = Number(value) || defaultValue
    return
  }

  process.env[name] = defaultValue
}

export function setPath(name, defaultValue) {
  const value = process.env[name]
  if (value && !value.endsWith('/')) {
    process.env[name] = value + '/'
    return
  }

  if (value) {
    return
  }

  process.env[name] = defaultValue
}
