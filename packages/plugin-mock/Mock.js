'use strict'

require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
})

const express = require('express')
const is = require('@doerjs/utils/is')
const file = require('@doerjs/utils/file')

const readScripts = file.reduceReaddirFactory((result, filePath) => {
  if (file.isDirectory(filePath)) {
    return result.concat(readScripts(filePath))
  }

  if (file.isScript(filePath)) {
    result.push(filePath)
  }

  return result
})

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

function readMocks(mockPath) {
  return readScripts(mockPath, []).reduce((result, filePath) => {
    delete require.cache[filePath]
    return {
      ...result,
      ...require(filePath).default,
    }
  }, {})
}

function Mock() {
  this.delay = Number(process.env.MOCK_DELAY)
  this.mockPath = null
}

Mock.prototype.setMockPath = function (mockPath) {
  this.mockPath = mockPath
}

Mock.prototype.create = function (app) {
  // application/json
  app.use(express.json())
  // application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }))
  app.use(process.env.MOCK_SERVER_PREFIX, (req, res, next) => {
    const url = `${req.method.toLocaleUpperCase()} ${req.path}`
    const mocks = readMocks(this.mockPath)
    const route = mocks[url]

    if (is.isFunction(route)) {
      delay(this.delay).then(() => route(req, res))
    } else {
      delay(this.delay).then(() => res.status(200).json(route))
    }
  })
}

module.exports = Mock
