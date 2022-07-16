const path = require('node:path')

const runtimePath = process.cwd()
const rootPath = path.resolve(__dirname, '../')

module.exports = {
  runtimePath,
  rootPath,
  packageJsonPath: path.resolve(rootPath, 'package.json'),
  templatePath: path.resolve(rootPath, 'template'),
  typescriptTemplatePath: path.resolve(rootPath, 'template-typescript'),
  nodeModulesPath: path.resolve(rootPath, 'node_modules'),
  appPackageJsonPath: path.resolve(runtimePath, 'package.json'),
}
