import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const cliPath = path.resolve(__dirname, '..')

export default {
  rootPath: cliPath,
  packagePath: path.resolve(cliPath, 'package.json'),
  nodeModulesPath: path.resolve(cliPath, 'node_modules'),
}
