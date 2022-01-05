import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getRootPath() {
  return path.resolve(__dirname, '../')
}

function getPkgJsonPath() {
  return path.join(getRootPath(), 'package.json')
}

export default {
  getRootPath,
  getPkgJsonPath,
}
