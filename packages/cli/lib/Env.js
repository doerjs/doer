'use strict'

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const file = require('@doerjs/utils/file')

function setString(name, defaultValue) {
  const value = process.env[name]
  if (value) {
    return
  }
  process.env[name] = defaultValue
}

function setBoolean(name, defaultValue) {
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

function setNumber(name, defaultValue) {
  const value = process.env[name]
  if (value) {
    process.env[name] = Number(value) || defaultValue
    return
  }

  process.env[name] = defaultValue
}

function setPath(name, defaultValue) {
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

function Env(option) {
  this.env = {}
  this.paths = option.paths
}

Env.prototype.parseFile = function () {
  const envFiles = [
    `${this.paths.appPaths.env}.${process.env.ENV}.local`,
    `${this.paths.appPaths.env}.${process.env.ENV}`,
    `${this.paths.appPaths.env}.local`,
    this.paths.appPaths.env,
  ]

  envFiles.forEach((envFile) => {
    if (file.isExist(envFile)) {
      dotenvExpand(dotenv.config({ path: envFile }))
    }
  })
}

Env.prototype.parseEnv = function () {
  setPath('PUBLIC_URL', '/')
  setNumber('IMAGE_INLINE_LIMIT_SIZE', 10000)
  setString('HOST', '0.0.0.0')
  setString('PORT', '3000')
  setString('ROOT_ELEMENT_ID', 'root')
  setBoolean('ENABLE_PROFILER', false)
  setBoolean('GZIP', false)
  setBoolean('ENABLE_ANALYZER', false)
  setBoolean('HTTPS', false)

  this.env = Object.keys(process.env)
    .filter((key) => /^APP_/i.test(key))
    .reduce(
      (result, key) => {
        result[key] = process.env[key]
        return result
      },
      {
        NODE_ENV: process.env.NODE_ENV,
        ENV: process.env.ENV,
        ROOT_ELEMENT_ID: process.env.ROOT_ELEMENT_ID,
        PUBLIC_URL: this.paths.appPaths.publicUrlPath,
      },
    )
}

Env.prototype.stringify = function () {
  return {
    'process.env': Object.keys(this.env).reduce((env, key) => {
      env[key] = JSON.stringify(this.env[key])
      return env
    }, {}),
  }
}

module.exports = Env
