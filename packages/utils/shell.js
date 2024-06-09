import childProcess from 'node:child_process'
import util from 'node:util'

export const execSync = childProcess.execSync

export const exec = util.promisify(childProcess.exec)
