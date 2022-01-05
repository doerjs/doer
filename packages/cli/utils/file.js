import fs from 'fs'

function isFileExist(filePath) {
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

export default {
  isFileExist,
  isFile,
  isDirectory,
  readFile,
}
