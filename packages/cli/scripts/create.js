'use strict'

const path = require('node:path')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const ejs = require('ejs')
const file = require('@doerjs/utils/file')
const logger = require('@doerjs/utils/logger')
const shell = require('@doerjs/utils/shell')

const cliBasePaths = require('../lib/cliBasePaths')

const spinning = ora()

function qa(params) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入应用名称',
      default: params.name,
      validate(value) {
        if (!/^[a-zA-Z]{1}[A-Za-z0-9_-]+$/.test(value)) {
          return '应用名称只能由字母、数字、下划线、中横线组成，且首字符为字母！'
        }
        return true
      },
    },
    {
      type: 'list',
      name: 'style',
      message: '请选择应用使用的样式处理器',
      default: 'css',
      choices: ['css', 'less'],
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: '是否使用typescript？',
      default: false,
    },
  ])
}

/**
 * 读取模版目录文件
 * isDirectory 是否是目录
 * isFile 是否是文件
 * isEjs 是否是ejs模板引擎文件
 * rawTemplateFilePath 原模板文件地址
 * templateFilePath 去掉模版引擎文件后缀地址
 */
function readTemplates(templatePath) {
  function resolveTemplate(result, filePath) {
    const { dir, ext, name } = path.parse(filePath)

    if (name === '.DS_Store') return result

    if (file.isDirectory(filePath)) {
      result.push({
        isDirectory: true,
        rawTemplateFilePath: filePath,
        templateFilePath: filePath,
      })

      const readChildTemplates = file.reduceReaddirFactory((res, item) => {
        return resolveTemplate(res, item)
      })

      return readChildTemplates(filePath, result)
    }

    const isEjs = ext === '.ejs'
    result.push({
      isFile: true,
      isEjs,
      rawTemplateFilePath: filePath,
      templateFilePath: isEjs ? path.resolve(dir, name) : filePath,
    })

    return result
  }

  const read = file.reduceReaddirFactory((result, filePath) => {
    return resolveTemplate(result, filePath)
  })

  spinning.text = '[获取模版] 基础应用模版'
  spinning.start()
  try {
    const templates = read(templatePath, [])
    spinning.succeed()
    return templates
  } catch (error) {
    spinning.fail()
    throw error
  }
}

function getEJSRenderData(answers) {
  const cliPackage = require(cliBasePaths.packageJsonPath)
  const eslintPackage = require('@doerjs/eslint-config/package.json')
  const prettierPackage = require('@doerjs/prettier-config/package.json')
  const pluginLessPackage = require('@doerjs/plugin-less/package.json')
  const pluginTypescriptPackage = require('@doerjs/plugin-typescript/package.json')

  return {
    answers,
    packages: {
      cli: cliPackage,
      eslint: eslintPackage,
      prettier: prettierPackage,
      pluginLess: pluginLessPackage,
      pluginTypescript: pluginTypescriptPackage,
    },
  }
}

/**
 * 安装应用依赖
 */
async function installDependencies(appPath) {
  spinning.text = '[安装依赖] 应用依赖'
  spinning.start()
  const { stdout } = await shell.exec(`cd ${appPath} && npm install`).catch((error) => {
    spinning.fail()
    throw new Error(error)
  })

  spinning.succeed()
  console.log(stdout)
}

function createDirectory(filePath) {
  spinning.text = `[创建目录] ${filePath}`
  spinning.start()
  const { stderr } = shell.execSync(`mkdir ${filePath}`)
  if (stderr) {
    spinning.fail()
    throw new Error(stderr.toString())
  }
  spinning.succeed()
}

function createFile(filePath, { template, data }) {
  spinning.text = `[创建文件] ${filePath}`
  spinning.start()
  try {
    let fileContent = file.readFileContent(template.rawTemplateFilePath)
    if (template.isEjs) {
      fileContent = ejs.render(fileContent, data)
    }
    file.writeFileContent(filePath, fileContent)
    spinning.succeed()
  } catch (error) {
    spinning.fail()
    throw error
  }
}

// 通过应用模版创建应用
async function createApplication(appPath, answers) {
  console.log()
  console.log(`👣 正在创建全新应用 ${chalk.greenBright(answers.name)}...`)
  console.log()

  const templatePath = answers.typescript ? cliBasePaths.typescriptTemplatePath : cliBasePaths.templatePath
  const templates = readTemplates(templatePath)

  readTemplates(cliBasePaths.templatePath)

  createDirectory(appPath)

  // 获取模版渲染数据，并输出模版
  const data = getEJSRenderData(answers)
  templates.forEach((template) => {
    const fileName = template.templateFilePath.replace(templatePath + path.sep, '')
    const filePath = path.resolve(appPath, fileName)

    if (template.isDirectory) {
      createDirectory(filePath)
      return
    }

    createFile(filePath, { template, data })
  })

  // 安装依赖失败时，不影响后续流程
  await installDependencies(appPath).catch((error) => {
    // no action
    console.error(error)
  })

  const { stderr } = shell.execSync(`cd ${appPath} && git init`)
  if (stderr) {
    console.error(stderr.toString())
  }

  console.log()
  console.log('👣 应用创建成功，感谢使用Doer')
  console.log()
  console.log('👣 你可以执行如下命令来启动程序')
  console.log('')
  console.log(`👣 ${chalk.yellowBright('cd ' + answers.name)}`)
  console.log('')
  console.log('👣 启动开发环境')
  console.log('')
  console.log(`👣 ${chalk.yellowBright('npm run dev')}`)
  console.log('')
  console.log('👣 启动数据模拟环境')
  console.log('')
  console.log(`👣 ${chalk.yellowBright('npm run mock')}`)
  console.log('')
  console.log('👣 打包生产环境')
  console.log('')
  console.log(`👣 ${chalk.yellowBright('npm run build')}`)
  console.log('')
  console.log('👣 开始你的欢乐代码之旅吧!!!')
  console.log('')
}

module.exports = async function create(params) {
  const answers = await qa(params)
  const appPath = path.resolve(cliBasePaths.runtimePath, answers.name)
  if (file.isExist(appPath)) {
    console.log()
    logger.fail(`目录已经存在，无法正常创建：${appPath}`)
    console.log()
    process.exit(-1)
  }

  createApplication(appPath, answers)
}
