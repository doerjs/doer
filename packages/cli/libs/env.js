import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { appPaths } from './path.js'
import file from './file.js'

const defaultEnv = {
  ENV: 'prod',
  NODE_ENV: 'production',
}

const env = process.env.ENV || defaultEnv.ENV

const envFiles = [
  // 当前环境生效的本地环境变量
  `${appPaths.env}.${env}.local`,
  // 所有环境生效的本地环境变量
  `${appPaths.env}.local`,
  // 当前环境生效的环境变量
  `${appPaths.env}.${env}`,
  // 所有环境生效的环境变量
  appPaths.env,
]

envFiles.forEach((envFile) => {
  if (file.isExist(envFiles)) {
    dotenvExpand(dotenv.config({ path: envFile }))
  }
})

// 获取项目中可以直接获取的环境变量
export default function getAppEnv(options) {
  const IS_APP_ENV = /^APP_/i

  const raw = Object.keys(process.env)
    .filter((key) => IS_APP_ENV.test(key))
    .reduce(
      (result, key) => {
        result[key] = process.env[key]
        return result
      },
      {
        NODE_ENV: process.env.NODE_ENV || defaultEnv.NODE_ENV,
        // 静态资源部署路径
        HOMEPAGE: options.homepage,
        // app版本号
        VERSION: options.version,
        // app名称
        NAME: options.name,
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
