'use strict'

const context = require('../context')

const packageData = require(context.paths.packageJsonPath)

module.exports = {
  'react': {
    singleton: true,
    requiredVersion: packageData.dependencies.react,
    strictVersion: true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: packageData.dependencies['react-dom'],
    strictVersion: true,
  },
  'react-router-dom': {
    singleton: true,
    requiredVersion: packageData.dependencies['react-router-dom'],
    strictVersion: true,
  },
  'history': {
    singleton: true,
    requiredVersion: packageData.dependencies.history,
    strictVersion: true,
  },
}
