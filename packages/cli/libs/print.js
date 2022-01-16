import chalk from 'chalk'
import figlet from 'figlet'

import helper from './helper.js'

function printLogo() {
  console.log(figlet.textSync('Traveler', 'Ghost'))
}

function printLog(message) {
  console.log(`👣 [ ] ${message}`)
}

function printWarn(message) {
  console.log(`👣 ${chalk.yellowBright('[!]')} ${message}`)
}

function printError(message) {
  console.log(`👣 ${chalk.redBright('[X]')} ${message}`)
}

function printSuccess(message) {
  console.log(`👣 ${chalk.greenBright('[√]')} ${message}`)
}

function printVersion() {
  const version = helper.getVersion()

  console.log()
  if (version) {
    console.log(`👣 Traveler v${version}`)
  } else {
    console.log('👣 Traveler Unknown Version')
  }
  console.log()
}

function printUnValidCommand(command) {
  printWarn(
    `无效的命令参数 ${chalk.bold(command)}，执行 \`${chalk.bold('traveler --help | traveler -h')}\` 获取帮助信息。`,
  )
  console.log()
}

function printUnValidNodeVersion(minNodeVersion) {
  printWarn(
    `Traveler 命令行所需最低Node版本${chalk.bold(minNodeVersion)}，当前Node版本${chalk.bold(helper.getNodeVersion())}`,
  )
  console.log()
}

function printHelp() {
  console.log('👣 用法: traveler <命令> [选项]')
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

export default {
  printLogo,
  printLog,
  printWarn,
  printError,
  printSuccess,
  printVersion,
  printHelp,
  printUnValidCommand,
  printUnValidNodeVersion,
}
