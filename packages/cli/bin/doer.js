#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const chalk = require('chalk')
const logger = require('@doerjs/utils/logger')

const helper = require('../lib/helper')
process.on('unhandledRejection', (err) => {
  throw err
})

helper.logo()
helper.version()

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
    helper.help()
  }

  process.exit(-1)
}

if (!isValidCommand) {
  logger.fail(
    `无效的命令参数111 ${chalk.bold(command)}，执行 \`${chalk.bold('doer --help | doer -h')}\` 获取帮助信息。`,
  )
  console.info()
  process.exit(-1)
}

switch (command) {
  case 'create':
    require('../scripts/create')({ name })
    break
  case 'dev':
    require('../scripts/dev')()
    break
  case 'build':
    require('../scripts/build')()
    break
}
