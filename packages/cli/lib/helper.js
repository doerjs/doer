'use strict'

const path = require('node:path')
const figlet = require('figlet')
const chalk = require('chalk')

const runtimePath = process.cwd()
const rootPath = path.resolve(__dirname, '../')

const packageJsonPath = path.resolve(rootPath, 'package.json')
const appPackageJsonPath = path.resolve(runtimePath, 'package.json')

function logo() {
  console.info(figlet.textSync('Doer', 'Ghost'))
}

function version() {
  const packageInfo = require(packageJsonPath)

  if (packageInfo.version) {
    console.info(`👣 Doer v${packageInfo.version}`)
  } else {
    console.info('👣 Doer Unknown Version')
  }

  console.info()
}

function name() {
  const packageInfo = require(appPackageJsonPath)

  if (packageInfo.name) {
    console.info(`👣 应用名称：${chalk.blue(chalk.bold(packageInfo.name))}`)
    console.info()
  }
}

function help() {
  console.info('👣 用法: doer <命令> [选项]')
  console.info()
  console.info('👣 选项:')
  console.info('👣   -v, --version       输出命令行版本号')
  console.info('👣   -h, --help          输出命令行用法信息')
  console.info()
  console.info('👣 命令:')
  console.info('👣   create [项目名称]     初始化默认模版项目')
  console.info('👣   dev                  启动开发环境')
  console.info('👣   build                打包项目文件用于发布')
  console.info()
}

module.exports = {
  logo,
  version,
  name,
  help,
}
