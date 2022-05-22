const figlet = require('figlet')
const chalk = require('chalk')

const constant = require('./constant')
const paths = require('./paths')

function logo() {
  console.log(figlet.textSync(constant.NAME, 'Ghost'))
}

function version() {
  const version = require(paths.cliPaths.packageJsonPath).version

  if (version) {
    console.log(`👣 Doer v${version}`)
  } else {
    console.log('👣 Doer Unknown Version')
  }
  console.log()
}

function name() {
  const name = require(paths.appPaths.packageJsonPath).name

  if (name) {
    console.log(`👣 应用名称：${chalk.blue(chalk.bold(name))}`)
    console.log()
  }
}

function help() {
  console.log('👣 用法: doer <命令> [选项]')
  console.log()
  console.log('👣 选项:')
  console.log('👣   -v, --version       输出命令行版本号')
  console.log('👣   -h, --help          输出命令行用法信息')
  console.log()
  console.log('👣 命令:')
  console.log('👣   create [项目名称]     初始化默认模版项目')
  console.log('👣   dev                  启动开发环境')
  console.log('👣   build                打包项目文件用于发布')
  console.log()
}

module.exports = {
  logo,
  version,
  help,
  name,
}
