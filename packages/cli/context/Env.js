'use strict'

const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const file = require('@doerjs/utils/file')
const env = require('@doerjs/utils/env')

const paths = require('./Paths')

class Env {
  // 单例实例
  static instance = null

  static getInstance() {
    if (!Env.instance) {
      Env.instance = new Env()
    }
    return Env.instance
  }

  // 环境变量对象
  env = {}

  _parseFile() {
    const envFiles = [
      `${paths.env}.${process.env.ENV}.local`,
      `${paths.env}.${process.env.ENV}`,
      `${paths.env}.local`,
      paths.env,
    ]

    envFiles.forEach((envFile) => {
      if (file.isExist(envFile)) {
        dotenvExpand.expand(dotenv.config({ path: envFile }))
      }
    })
  }

  _parseEnv() {
    env.setPath('PUBLIC_URL', '/')

    if (process.env.NODE_ENV === 'development' && process.env.PUBLIC_URL.startsWith('http')) {
      const publicUrl = new URL(process.env.PUBLIC_URL, 'https://doer.cli.com')
      process.env.PUBLIC_URL = publicUrl.pathname
    }

    process.env.PUBLIC_URL = process.env.PUBLIC_URL.endsWith('/')
      ? process.env.PUBLIC_URL
      : process.env.PUBLIC_URL + '/'

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

  /**
   * 解析环境变量
   * @return
   */
  parse() {
    this._parseFile()
    this._parseEnv()
  }

  /**
   * 将当前环境变量转换为对象
   * 用于提供给webpack define插件注入环境变量到应用程序中使用
   * @return {Object} 环境变量对象
   */
  stringify() {
    return {
      'process.env': Object.keys(this.env).reduce((env, key) => {
        env[key] = JSON.stringify(this.env[key])
        return env
      }, {}),
    }
  }
}

module.exports = Env.getInstance()
