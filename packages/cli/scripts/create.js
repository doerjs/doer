import inquirer from 'inquirer'
import ora from 'ora'
import shelljs from 'shelljs'
import chalk from 'chalk'
import ejs from 'ejs'
import file from '../libs/file.js'
import path, { cliPaths } from '../libs/path.js'
import print from '../libs/print.js'
import helper from '../libs/helper.js'

function qa(options) {
  const { name = '' } = options

  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入应用名称',
      default: name,
      validate(value) {
        if (!/^[a-zA-Z]{1}[A-Za-z0-9_-]+$/.test(value)) {
          return '应用名称只能由字母、数字、下划线、中横线组成，且首字符为字母！'
        }
        return true
      },
    },
    {
      type: 'confirm',
      name: 'mock',
      message: '是否启用数据模拟服务',
      default: true,
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: '是否启用Eslint语法检查',
      default: true,
    },
    {
      type: 'confirm',
      name: 'prettier',
      message: '是否启用Prettier格式化',
      default: true,
    },
    // {
    //   type: 'list',
    //   name: 'style',
    //   message: '请选择样式预处理语言',
    //   default: 'less',
    //   choices: ['less', 'scss', 'css'],
    // },
  ])
}

// 初步匹配模版文件名中的可能正确的表达式
const templateExprRegExp = /^\[(.*?)\]/

// 忽略的模板文件
const ignoreFiles = [/\.DS_Store/]

// 解析模板文件中的表达式
function resolveTemplateExpr(fileName) {
  const matched = fileName.match(templateExprRegExp)
  if (!matched) {
    return
  }

  const [expr, content = ''] = matched

  // 布尔类型表达式[?name]
  const isBooleanExpr = content.indexOf('?') === 0
  if (isBooleanExpr) {
    return { name: content.replace('?', ''), value: true, expr }
  }

  // 相等类型表达式[name=value]
  const exprParts = content.split('=')
  const isEqualExpr = exprParts.length === 2 && exprParts[0]
  if (isEqualExpr) {
    return { name: exprParts[0], value: exprParts[1], expr }
  }
}

/**
 * 校验模版文件是否需要生成
 */
function validTemplateFileNameExpr(fileName, options) {
  const templateExpr = resolveTemplateExpr(fileName)

  if (helper.isUndefined(templateExpr)) {
    return true
  }

  return options[templateExpr.name] === templateExpr.value
}

/**
 * 去除模板文件变量
 */
function removeTemplateFileNameExpr(filePath) {
  const { base: fileName } = path.parse(filePath)
  const templateExpr = resolveTemplateExpr(fileName)

  if (helper.isUndefined(templateExpr)) {
    return filePath
  }
  return filePath.replace(templateExpr.expr, '')
}

/**
 * 读取模版目录文件
 * isDirectory 是否是目录
 * isFile 是否是文件
 * isEjs 是否是ejs模板引擎文件
 * templateFilePath 模板文件地址
 * targetFilePath 目标文件文件地址
 */
function readTemplateDeep(templatePath, options) {
  const templates = []

  const readDirFiles = file.readDirFactory(function (filePath) {
    const { dir, base: fileName, ext, name } = path.parse(filePath)

    if (file.isDirectory(filePath) && validTemplateFileNameExpr(fileName, options)) {
      templates.push({
        isDirectory: true,
        templateFilePath: filePath,
        targetFilePath: removeTemplateFileNameExpr(filePath),
      })
      readDirFiles(filePath)
      return
    }

    const isIgnore = ignoreFiles.some((regExp) => regExp.test(filePath))
    if (isIgnore) {
      return
    }

    if (validTemplateFileNameExpr(fileName, options)) {
      const isEjs = ext === '.ejs'

      const template = {
        isFile: true,
        isEjs,
        templateFilePath: filePath,
        targetFilePath: removeTemplateFileNameExpr(filePath),
      }

      if (template.isEjs) {
        template.targetFilePath = removeTemplateFileNameExpr(path.resolve(dir, name))
      }

      templates.push(template)
    }
  })

  readDirFiles(templatePath)

  return templates
}

export default async function create(options) {
  const answers = await qa(options)

  const loading = ora()
  const appPath = path.resolve(cliPaths.runtimePath, answers.name)
  if (file.isExist(appPath)) {
    console.log()
    print.printError(`目录已经存在，无法正常创建：${appPath}`)
    console.log()
    process.exit()
  }

  console.log()
  console.log(`👣 正在创建全新应用 ${chalk.greenBright(answers.name)}...`)
  console.log()

  loading.start()

  loading.text = `[创建应用] ${chalk.cyan(answers.name)}`
  shelljs.mkdir('-p', answers.name)
  loading.succeed()

  loading.text = `[进入应用] ${chalk.cyan(answers.name)}`
  shelljs.cd(answers.name)
  loading.succeed()

  loading.text = '[获取模版] 基础应用模版'
  const templates = readTemplateDeep(cliPaths.templatePath, answers)
  loading.succeed()
  templates.forEach((template) => {
    const fileName = template.targetFilePath.replace(cliPaths.templatePath + path.sep, '')
    const filePath = path.resolve(appPath, fileName)

    if (template.isDirectory) {
      loading.text = `[创建目录] ${chalk.greenBright(fileName)}`
      shelljs.mkdir('-p', filePath)
      loading.succeed()
      return
    }

    loading.text = `[创建文件] ${fileName}`
    let fileContent = file.readFile(template.templateFilePath)
    if (template.isEjs) {
      fileContent = ejs.render(fileContent, answers)
    }
    file.writeFile(filePath, fileContent)
    loading.succeed()
  })

  loading.stop()
  console.log()
  console.log('👣 应用创建成功，开始你的代码之旅吧')
  console.log()
}
