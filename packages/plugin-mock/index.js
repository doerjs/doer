import path from 'node:path'
import * as env from '@doerjs/utils/env.js'

import Mock from './Mock.js'

export default function (plugin) {
  const mock = new Mock()

  function createMock(devServer) {
    if (process.env.MOCK === 'true') {
      mock.create(devServer.app)
    }
  }

  plugin.hooks.context.tap((context) => {
    env.setBoolean('MOCK', false)
    env.setNumber('MOCK_DELAY', 0)
    env.setString('MOCK_SERVER_PREFIX', '/mock')

    mock.setMockPath(path.resolve(context.path.runtime, 'mocks'))
  })

  plugin.hooks.webpackDevServerConfigure.tap((webpackDevServerConfigure) => {
    const oldSetupMiddlewares = webpackDevServerConfigure.get('setupMiddlewares')?.toValue()
    webpackDevServerConfigure.set('setupMiddlewares', function (middlewares, devServer) {
      createMock(devServer)
      const nextMiddlewares = oldSetupMiddlewares ? oldSetupMiddlewares(middlewares, devServer) : middlewares
      return nextMiddlewares
    })
  })
}
