#! /usr/bin/env node

import minimist from 'minimist'
import print from '../libs/print.js'
import assert from '../libs/assert.js'
import create from '../scripts/create.js'

print.printLogo()
print.printVersion()

assert.assertNodeVersion()

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
    print.printHelp()
  }

  process.exit()
}

if (!isValidCommand) {
  print.printUnValidCommand(command)
  process.exit(9)
}

switch (command) {
  case 'create':
    create({ name })
    break
  case 'dev':
    break
  case 'build':
    break
}
