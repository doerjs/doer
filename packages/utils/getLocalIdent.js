'use strict'

const path = require('node:path')
const loaderUtils = require('loader-utils')

function getLocalIdent(context, localIdentName, localName, options) {
  const { dir, name } = path.parse(context.resourcePath)
  const res = path.parse(path.resolve(dir, name))

  const hashKey =
    path.basename(context.rootContext) + path.sep + path.posix.relative(context.rootContext, context.resourcePath)
  const hash = loaderUtils.getHashDigest(hashKey, 'md5', 'base64', 5)

  return `${res.name}__${localName}--${hash}`
}

module.exports = getLocalIdent
