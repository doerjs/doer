#!/usr/bin/env node

import cluster from 'node:cluster'
import { createRequire } from 'node:module'
import { Command, Option, InvalidArgumentError } from 'commander'
import figlet from 'figlet'
import * as is from '@doerjs/utils/is.js'

import cliPath from '../context/cliPath.js'
import create, { validateName } from '../scripts/create.js'
import dev from '../scripts/dev.js'
import build from '../scripts/build.js'

// 支持服务重启功能
if (cluster.isPrimary) {
  let worker
  function create() {
    worker = cluster.fork()
    worker.on('message', (message) => {
      if (message === 'RESTART') {
        worker.kill('SIGINT')
        create()
      }
    })
  }
  create()
} else {
  const require = createRequire(import.meta.url)
  const cliPackage = require(cliPath.packagePath)

  console.info(figlet.textSync('Doer', 'Ghost'))
  console.info(`👣 Doer v${cliPackage.version}`)
  console.info()

  function ensureName(value) {
    const message = validateName(value)
    if (is.isString(message) && message) {
      throw new InvalidArgumentError(message)
    }

    return value
  }

  const cli = new Command()

  cli
    .name('doer')
    .description('一款集项目模版，研发和打包一体化的工具集合')
    .version(cliPackage.version, '-v --version', '查看工具版本号')
    .helpOption('-h, --help', '查看帮助信息')
    .helpCommand(false)

  cli
    .command('create')
    .description('创建模版项目')
    .argument('[name]', '项目或者库名称', ensureName)
    .addOption(
      new Option('-t, --type <type>', '创建的模版类型，project项目类型，library库类型').choices(['project', 'library']),
    )
    .addOption(new Option('-s, --style <style>', '使用哪种样式处理器').choices(['css', 'less']))
    .option('--typescript', '是否使用typescript')
    .action((name, options) => {
      create({ name, ...options })
    })

  cli
    .command('dev')
    .description('启动开发环境')
    .action(() => {
      dev()
    })

  cli
    .command('build')
    .description('打包项目工程')
    .action(() => {
      build()
    })

  cli.parse()
}
