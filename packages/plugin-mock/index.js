const path = require('node:path')
const is = require('@doerjs/utils/is')
const env = require('@doerjs/utils/env')

const Mock = require('./Mock')

module.exports = function (plugin, option) {
  const mock = new Mock()

  plugin.hooks.environment.tap('Mock', (doer) => {
    env.setBoolean('MOCK', false)
    env.setNumber('MOCK_DELAY', 0)
    env.setString('MOCK_SERVER_PREFIX', '/mock')

    mock.setMockPath(path.resolve(doer.paths.cliPaths.runtimePath, 'mocks'))
  })

  plugin.hooks.devServer.tap('Mock', (config) => {
    if (is.isFunction(config.setupMiddlewares)) {
      const oldSetupMiddlewares = config.setupMiddlewares
      config.setupMiddlewares = function (middlewares, devServer) {
        if (process.env.MOCK === 'true') {
          mock.create(devServer.app)
        }

        const nextMiddlewares = oldSetupMiddlewares(middlewares, devServer)
        return nextMiddlewares
      }
      return
    }

    config.setupMiddlewares = function (middlewares, devServer) {
      if (process.env.MOCK === 'true') {
        mock.create(devServer.app)
      }

      return middlewares
    }
  })
}
