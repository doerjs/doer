import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const cliPath = path.resolve(__dirname, '..')
export const cliPackageJsonPath = path.resolve(cliPath, 'package.json')
