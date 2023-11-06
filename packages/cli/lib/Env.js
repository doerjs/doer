'use strict'

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const file = require('@doerjs/utils/file')
const env = require('@doerjs/utils/env')

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
      dotenvExpand.expand(dotenv.config({ path: envFile }))
    }
  })
}

Env.prototype.parseEnv = function () {
  env.setPath('PUBLIC_URL', '/')

  if (process.env.NODE_ENV === 'development' && process.env.PUBLIC_URL.startsWith('http')) {
    const publicUrl = new URL(process.env.PUBLIC_URL, 'https://doer.cli.com')
    process.env.PUBLIC_URL = publicUrl.pathname
  }

  process.env.PUBLIC_URL = process.env.PUBLIC_URL.endsWith('/') ? process.env.PUBLIC_URL : process.env.PUBLIC_URL + '/'

  env.setNumber('IMAGE_INLINE_LIMIT_SIZE', 10000)
  env.setString('HOST', '0.0.0.0')
  env.setString('PORT', '3000')
  env.setString('ROOT_ELEMENT_ID', 'root')
  env.setBoolean('ENABLE_PROFILER', false)
  env.setBoolean('GZIP', false)
  env.setBoolean('ENABLE_ANALYZER', false)
  env.setBoolean('HTTPS', false)

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
        PUBLIC_URL: process.env.PUBLIC_URL,
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
