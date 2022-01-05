#! /usr/bin/env node

import minimist from 'minimist'
import print from '../utils/print.js'
import assert from '../utils/assert.js'

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

const [command] = argv._

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
    break
  case 'dev':
    break
  case 'build':
    break
}
