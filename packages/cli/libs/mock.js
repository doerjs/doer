require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
})

const is = require('@doerjs/utils/is')
const bodyParser = require('body-parser')

const paths = require('./paths')
const util = require('./utils/util')
const file = require('./utils/file')

const readScripts = file.reduceReaddirFactory((result, filePath) => {
  if (file.isDirectory(filePath)) {
    return result.concat(readScripts(filePath))
  }

  if (file.isScript(filePath)) {
    result.push(filePath)
  }

  return result
})

function readMocks() {
  return readScripts(paths.appPaths.mockPath, []).reduce((result, filePath) => {
    delete require.cache[filePath]
    return {
      ...result,
      ...require(filePath).default,
    }
  }, {})
}

const delayTime = parseInt(process.env.MOCK_DELAY)
function router(req, res, next) {
  const url = `${req.method.toLocaleUpperCase()} ${req.path}`

  const mocks = readMocks()
  const route = mocks[url]

  if (is.isFunction(route)) {
    util.delay(parseInt(delayTime)).then(() => route(req, res))
  } else {
    util.delay(delayTime).then(() => res.status(200).json(route))
  }
}

module.exports = function mock(app) {
  // application/json
  app.use(bodyParser.json())
  // application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded())
  app.use(process.env.MOCK_SERVER_PREFIX, router)
}
