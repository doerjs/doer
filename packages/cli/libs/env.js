'use strict'

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const paths = require('./paths')
const file = require('./utils/file')

const env = process.env.ENV || 'prod'

const envFiles = [
  // 当前环境生效的本地环境变量
  `${paths.appPaths.env}.${env}.local`,
  // 所有环境生效的本地环境变量
  `${paths.appPaths.env}.local`,
  // 当前环境生效的环境变量
  `${paths.appPaths.env}.${env}`,
  // 所有环境生效的环境变量
  paths.appPaths.env,
]

envFiles.forEach((envFile) => {
  if (file.isExist(envFiles)) {
    dotenvExpand(dotenv.config({ path: envFile }))
  }
})

// 获取项目中可以直接获取的环境变量
function getAppEnv() {
  const cliPackage = require(paths.cliPaths.packageJsonPath)

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
        // app版本号
        VERSION: cliPackage.version,
        // app名称
        NAME: cliPackage.name,
        PUBLIC_URL: process.env.PUBLIC_URL || '/',
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
