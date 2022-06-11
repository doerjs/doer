'use strict'

const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const file = require('./utils/file')

function parseEnv() {
  const envFilePath = path.resolve(process.cwd(), './.env')

  const envFiles = [
    `${envFilePath}.${process.env.ENV}.local`,
    `${envFilePath}.${process.env.ENV}`,
    `${envFilePath}.local`,
    envFilePath,
  ]

  envFiles.forEach((envFile) => {
    if (file.isExist(envFile)) {
      dotenvExpand(dotenv.config({ path: envFile }))
    }
  })

  if (!process.env.PUBLIC_URL) {
    process.env.PUBLIC_URL = '/'
  } else if (!process.env.PUBLIC_URL.endsWith('/')) {
    process.env.PUBLIC_URL = process.env.PUBLIC_URL + '/'
  }

  if (!process.env.IMAGE_INLINE_LIMIT_SIZE) {
    process.env.IMAGE_INLINE_LIMIT_SIZE = 10000
  } else {
    process.env.IMAGE_INLINE_LIMIT_SIZE = Number(process.env.IMAGE_INLINE_LIMIT_SIZE) || 10000
  }

  if (!process.env.HOST) {
    process.env.HOST = '0.0.0.0'
  }

  if (!process.env.PORT) {
    process.env.PORT = '3000'
  }

  if (!process.env.MOCK_DELAY) {
    process.env.MOCK_DELAY = 0
  } else {
    process.env.MOCK_DELAY = Number(process.env.MOCK_DELAY) || 0
  }

  if (!process.env.ROOT_ELEMENT_ID) {
    process.env.ROOT_ELEMENT_ID = 'root'
  }

  if (!process.env.MOCK_SERVER_PREFIX) {
    process.env.MOCK_SERVER_PREFIX = '/mock'
  }
}

function getEnv(paths) {
  const IS_APP_ENV = /^APP_/i

  const raw = Object.keys(process.env)
    .filter((key) => IS_APP_ENV.test(key))
    .reduce(
      (result, key) => {
        result[key] = process.env[key]
        return result
      },
      {
        NODE_ENV: process.env.NODE_ENV,
        ENV: process.env.ENV,
        PUBLIC_URL: paths.appPaths.getPublicUrlPath(),
        ROOT_ELEMENT_ID: process.env.ROOT_ELEMENT_ID,
        MOCK_SERVER_PREFIX: process.env.MOCK_SERVER_PREFIX,
      },
    )

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

module.exports = {
  parseEnv,
  getEnv,
}
