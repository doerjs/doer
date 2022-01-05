import path from './path.js'
import file from './file.js'

function getNodeVersion() {
  return process.version.replace('v', '')
}

function getVersion() {
  const pkgJsonFilePath = path.getPkgJsonPath()

  if (file.isFileExist(pkgJsonFilePath)) {
    const pkgJson = file.readFile(pkgJsonFilePath)
    try {
      const pkg = JSON.parse(pkgJson)
      return pkg.version
    } catch (e) {}
  }
}

export default {
  getVersion,
  getNodeVersion,
}
