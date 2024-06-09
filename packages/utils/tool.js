import path from 'node:path'

// 路径转换为webpack路径
export function toPosixPath(filePath) {
  return filePath.replace(new RegExp(path.sep, 'g'), '/')
}

// 首字母大写
export function toFirstUpperCase(str) {
  return str.replace(/^\S/, (c) => c.toUpperCase())
}
