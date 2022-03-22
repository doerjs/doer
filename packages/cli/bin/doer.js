#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const figlet = require('figlet')
const chalk = require('chalk')
const logger = require('../libs/utils/logger')
const paths = require('../libs/paths')

const create = require('../scripts/create')
const dev = require('../scripts/dev')

function printLogo() {
  console.log(figlet.textSync('Doer', 'Ghost'))
}

function printVersion() {
  const version = require(paths.cliPaths.packageJsonPath).version

  console.log()
  if (version) {
    console.log(`👣 Doer v${version}`)
  } else {
    console.log('👣 Doer Unknown Version')
  }
  console.log()
}

function printHelp() {
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

printLogo()
printVersion()

const argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['help', 'version'],
  alias: {
    version: ['v'],
    help: ['h'],
  },
})

const [command, name] = argv._

const VALID_COMMANDS = ['create', 'dev', 'build']
const isValidCommand = command && VALID_COMMANDS.some((c) => c === command)

if (!command) {
  if (argv.version) {
    // no action
  } else {
    printHelp()
  }

  process.exit(-1)
}

if (!isValidCommand) {
  logger.fail(`无效的命令参数 ${chalk.bold(command)}，执行 \`${chalk.bold('doer --help | doer -h')}\` 获取帮助信息。`)
  console.log()
  process.exit(-1)
}

switch (command) {
  case 'create':
    create({ name })
    break
  case 'dev':
    dev()
    break
  case 'build':
    break
}
