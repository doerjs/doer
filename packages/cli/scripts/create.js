import { createRequire } from 'node:module'
import path from 'node:path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import download from 'download-git-repo'
import ora from 'ora'
import ejs from 'ejs'
import trace from '@doerjs/utils/trace.js'
import * as is from '@doerjs/utils/is.js'
import * as file from '@doerjs/utils/file.js'
import * as shell from '@doerjs/utils/shell.js'

import { cliPackageJsonPath } from '../lib/cliPath.js'

const require = createRequire(import.meta.url)

function downloadTemplate(source, target) {
  return new Promise((resolve, reject) => {
    download(source, target, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export function validateName(value) {
  if (!/^[a-zA-Z]{1}[A-Za-z0-9_-]+$/.test(value)) {
    return '应用名称只能由字母、数字、下划线、中横线组成，且首字符为字母！'
  }

  return true
}

async function answers(options) {
  const data = []

  if (is.isUndefined(options.name)) {
    data.push({
      type: 'input',
      name: 'name',
      message: '项目或者库名称',
      validate: validateName,
    })
  }

  if (is.isUndefined(options.type)) {
    data.push({
      type: 'list',
      name: 'mode',
      message: '创建哪种项目?',
      default: 'project',
      choices: ['project', 'library'],
    })
  }

  if (is.isUndefined(options.style)) {
    data.push({
      type: 'list',
      name: 'style',
      message: '使用哪种样式处理器?',
      default: 'css',
      choices: ['css', 'less'],
    })
  }

  if (!options.typescript) {
    data.push({
      type: 'confirm',
      name: 'typescript',
      message: '是否使用typescript?',
      default: false,
    })
  }

  if (data.length) {
    const result = await inquirer.prompt(data)
    return { ...options, ...result }
  }

  return Promise.resolve(options)
}

export default async function create(options) {
  const config = await answers(options)
  const template = config.typescript ? 'doerjs/template-typescript#main' : 'doerjs/template-javascript#main'

  console.info()
  const spin = ora('下载项目模版').start()
  const projectPath = `./${config.name}`
  await downloadTemplate(template, projectPath).catch((error) => {
    spin.clear()
    spin.stop()
    trace.error('下载项目模版失败')
    console.info()
    throw error
  })
  spin.clear()
  spin.stop()
  trace.success('下载项目模版成功')
  console.info()

  const templateFiles = file.readdirDeep(projectPath).filter((filePath) => {
    const ext = path.extname(filePath)
    return ext === '.ejs'
  })

  const renderContext = {
    config,
    packages: {
      '@doerjs/cli': require(cliPackageJsonPath),
      '@doerjs/utils': require('@doerjs/utils/package.json'),
      '@doerjs/prettier-config': require('@doerjs/prettier-config/package.json'),
      '@doerjs/eslint-config': require('@doerjs/eslint-config/package.json'),
      '@doerjs/plugin-less': require('@doerjs/plugin-less/package.json'),
      '@doerjs/plugin-mock': require('@doerjs/plugin-mock/package.json'),
      '@doerjs/plugin-typescript': require('@doerjs/plugin-typescript/package.json'),
    },
  }

  for (let i = 0; i < templateFiles.length; i++) {
    trace.note(`[%d/${templateFiles.length}] - 模版应用中...`, i + 1)
    const templateFilePath = templateFiles[i]
    const templateContent = file.readFile(templateFilePath)
    const { dir, name } = path.parse(templateFilePath)
    const nextPath = path.resolve(dir, name)
    const content = ejs.render(templateContent, renderContext)
    file.writeFile(nextPath, content)
    shell.execSync(`rm ${templateFilePath}`)
  }

  console.info()

  shell.execSync(`cd ${projectPath} && git init`)

  trace.note('应用创建成功，感谢使用Doer')
  trace.note('你可以执行如下命令来启动程序')
  console.info()
  trace.note('进入目录')
  trace.note(chalk.yellowBright('cd ' + config.name))
  console.info()
  trace.note('安装依赖')
  trace.note(chalk.yellowBright('npm install'))
  console.info()
  trace.note('启动开发环境')
  trace.note(chalk.yellowBright('npm run dev'))
  console.info()
  trace.note('打包生产环境')
  trace.note(chalk.yellowBright('npm run build'))
  console.info()
  trace.note('开始你的欢乐代码之旅吧!!!')
  console.info()
}
