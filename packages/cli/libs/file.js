import fs from 'fs'
import path from './path.js'

function isExist(filePath) {
  return fs.existsSync(filePath)
}

function isDirectory(filePath) {
  return fs.statSync(filePath).isDirectory()
}

function isFile(filePath) {
  return fs.statSync(filePath).isFile()
}

function readFile(filePath) {
  return fs.readFileSync(filePath).toString()
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content)
}

function readDirFactory(resolve) {
  return function (filePath) {
    fs.readdirSync(filePath).forEach((fileName) => {
      const fullFilePath = path.resolve(filePath, fileName)
      resolve(fullFilePath)
    })
  }
}

export default {
  isExist,
  isFile,
  isDirectory,
  readFile,
  writeFile,
  readDirFactory,
}
