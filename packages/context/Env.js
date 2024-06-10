import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import * as file from '@doerjs/utils/file.js'
import * as env from '@doerjs/utils/env.js'

import Parser from './Parser.js'

class Env extends Parser {
  // 存储当前环境变量
  env = {}

  constructor(pathInstance) {
    super()
    // 解析环境变量文件
    // 整体解析逻辑不做覆盖处理
    // 意味着最先解析的同名环境变量优先生效
    const envPaths = [
      `${pathInstance.env}.${process.env.ENV}.local`,
      `${pathInstance.env}.${process.env.ENV}`,
      `${pathInstance.env}.local`,
      pathInstance.env,
    ].filter(file.isExist)
    // 支持环境变量的模版字符串语法
    envPaths.forEach((envFile) => {
      if (file.isExist(envFile)) {
        dotenvExpand.expand(dotenv.config({ path: envFile }))
      }
    })

    // 默认设置为根路径
    env.setPath('PUBLIC_URL', '/')
    // 开发环境下，PUBLIC_URL 以 http 开头，去除域名部分，仅保留路径部分
    if (process.env.NODE_ENV === 'development' && process.env.PUBLIC_URL.startsWith('http')) {
      const publicUrl = new URL(process.env.PUBLIC_URL, 'https://cli.copower.dev')
      process.env.PUBLIC_URL = publicUrl.pathname
    }
    // 确保路径以 / 结尾
    process.env.PUBLIC_URL = process.env.PUBLIC_URL.endsWith('/')
      ? process.env.PUBLIC_URL
      : process.env.PUBLIC_URL + '/'

    env.setNumber('IMAGE_INLINE_LIMIT_SIZE', 10000)
    env.setString('HOST', '0.0.0.0')
    env.setString('PORT', '3000')
    env.setString('HTTPS_PORT', '443')
    env.setString('ROOT_ELEMENT_ID', 'root')
    env.setBoolean('ENABLE_PROFILER', false)
    env.setBoolean('GZIP', false)
    env.setBoolean('ENABLE_ANALYZER', false)
    env.setBoolean('HTTPS', false)
    env.setBoolean('FAST_REFRESH', false)

    // 解析自定义环境变量，都是以APP_打头
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

  static instance = null

  static create(pathInstance) {
    if (!Env.instance) {
      Env.instance = new Env(pathInstance)
    }

    return Env.instance
  }

  stringify() {
    return {
      'process.env': Object.keys(this.env).reduce((env, key) => {
        env[key] = JSON.stringify(this.env[key])
        return env
      }, {}),
    }
  }
}

export default Env
