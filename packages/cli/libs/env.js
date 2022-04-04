'use strict'

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const file = require('./utils/file')
const paths = require('./paths')

if (!process.env.ENV) {
  process.env.ENV = 'prod'
}

const envFiles = [
  // 当前环境生效的本地环境变量
  `${paths.appPaths.env}.${process.env.ENV}.local`,
  // 当前环境生效的环境变量
  `${paths.appPaths.env}.${process.env.ENV}`,
  // 所有环境生效的本地环境变量
  `${paths.appPaths.env}.local`,
  // 所有环境生效的环境变量
  paths.appPaths.env,
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
  process.env.IMAGE_INLINE_LIMIT_SIZE = '10000'
}

if (!process.env.HOST) {
  process.env.HOST = '0.0.0.0'
}

if (!process.env.PORT) {
  process.env.PORT = '3000'
}

if (!process.env.MOCK_DELAY) {
  process.env.MOCK_DELAY = '0'
}

if (!process.env.ROOT_ELEMENT_ID) {
  process.env.ROOT_ELEMENT_ID = 'root'
}

if (!process.env.MOCK_SERVER_PREFIX) {
  process.env.MOCK_SERVER_PREFIX = '/mock'
}

// 获取项目中可以直接获取的环境变量
function getAppEnv() {
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
        // app环境
        ENV: process.env.ENV,
        PUBLIC_URL: process.env.PUBLIC_URL,
        ROOT_ELEMENT_ID: process.env.ROOT_ELEMENT_ID,
        MOCK_SERVER_PREFIX: process.env.MOCK_SERVER_PREFIX,
      },
    )

  // 格式化环境变量用于webpackDefine插件注入
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

module.exports = getAppEnv()
