import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cliRootPath = path.resolve(__dirname, '../')
const cliRuntimePath = process.cwd()

// 命令行工具目录路径
export const cliPaths = {
  // 工具根目录
  rootPath: cliRootPath,
  // 工具运行时根目录
  runtimePath: cliRuntimePath,
  packageJsonPath: path.resolve(cliRootPath, 'package.json'),
  // 模版目录
  templatePath: path.resolve(cliRootPath, 'template'),
}

// app目录路径
export const appPaths = {
  // 环境变量路径
  env: path.resolve(cliPaths.runtimePath, './env'),
  packageJsonPath: path.resolve(cliPaths.runtimePath, 'package.json'),
}

export default path
