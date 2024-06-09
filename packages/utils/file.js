import path from 'node:path'
import fs from 'node:fs'

// 是否存在
export function isExist(filePath) {
  return !!fs.statSync(filePath, { throwIfNoEntry: false })
}

// 是一个文件
export function isFile(filePath) {
  if (!isExist(filePath)) {
    return false
  }

  return fs.statSync(filePath).isFile()
}

// 是一个文件夹
export function isDir(filePath) {
  if (!isExist(filePath)) {
    return false
  }

  return fs.statSync(filePath).isDirectory()
}

// 是否为空
export function isEmpty(filePath) {
  if (!isExist(filePath)) {
    return true
  }

  if (isFile(filePath)) {
    return !readFile(filePath).length
  }

  return !readdir(filePath).length
}

// 是否是脚本
export function isScript(filePath) {
  if (!isExist(filePath)) {
    return false
  }

  const ext = path.extname(filePath)
  return ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.cjs', '.ejs'].includes(ext)
}

// 读取文件内容
export function readFile(filePath) {
  if (!isExist(filePath)) {
    return ''
  }

  return fs.readFileSync(filePath).toString()
}

// 写入文件内容
export function writeFile(filePath, content) {
  const dirname = path.dirname(filePath)
  if (!isExist(dirname)) {
    mkdir(dirname)
  }

  fs.writeFileSync(filePath, content)
}

// 创建文件夹
export function mkdir(filePath) {
  if (isExist(filePath) && isDir(filePath)) {
    return
  }

  fs.mkdirSync(filePath, { recursive: true })
}

// 读取文件夹
export function readdir(filePath) {
  if (!isExist(filePath)) {
    return []
  }

  return fs
    .readdirSync(filePath)
    .map((fileName) => {
      return path.resolve(filePath, fileName)
    })
    .filter(isFile)
}

export function eachFile(filePath, fn) {
  if (!isExist(filePath)) {
    return
  }

  function readdir(currentFilePath) {
    fs.readdirSync(currentFilePath)
      .map((fileName) => {
        return path.resolve(currentFilePath, fileName)
      })
      .forEach((item) => {
        if (isFile(item)) {
          fn(item)
          return
        }

        readdir(item)
      })
  }

  readdir(filePath)
}

// 深度递归读取文件夹
export function readdirDeep(filePath) {
  if (!isExist(filePath)) {
    return []
  }

  const files = []
  function readdir(currentFilePath) {
    fs.readdirSync(currentFilePath)
      .map((fileName) => {
        return path.resolve(currentFilePath, fileName)
      })
      .forEach((item) => {
        if (isFile(item)) {
          files.push(item)
          return
        }

        readdir(item)
      })
  }

  readdir(filePath)

  return files
}
