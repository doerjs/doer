import { createRequire } from 'node:module'
import express from 'express'
import cors from 'cors'
import * as is from '@doerjs/utils/is.js'
import * as file from '@doerjs/utils/file.js'

const require = createRequire(import.meta.url)

function readScripts(filePath) {
  return file.readdirDeep(filePath).filter(file.isScript)
}

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

export default class Mock {
  constructor() {
    this.delay = Number(process.env.MOCK_DELAY)
    this.mockPath = null
  }

  setMockPath(mockPath) {
    this.mockPath = mockPath
  }

  create(app) {
    // 跨域
    app.use(cors())
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
}
