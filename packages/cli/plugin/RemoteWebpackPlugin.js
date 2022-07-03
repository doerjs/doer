'use strict'

const RuntimeGlobals = require('webpack/lib/RuntimeGlobals')
const ExternalModule = require('webpack/lib/ExternalModule')
const FallbackDependency = require('webpack/lib/container/FallbackDependency')
const FallbackItemDependency = require('webpack/lib/container/FallbackItemDependency')
const FallbackModuleFactory = require('webpack/lib/container/FallbackModuleFactory')
const RemoteModule = require('webpack/lib/container/RemoteModule')
const RemoteRuntimeModule = require('webpack/lib/container/RemoteRuntimeModule')
const RemoteToExternalDependency = require('webpack/lib/container/RemoteToExternalDependency')

class RemoteWebpackPlugin {
  constructor(options = {}) {
    this.remoteFileName = options.fileName || 'remote.js'
    this.key = 'remote:'
    this.type = 'script'
    this.referencePath = 'webpack/container/reference/'
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('RemoteWebpackPlugin', (compilation, { normalModuleFactory }) => {
      compilation.dependencyFactories.set(RemoteToExternalDependency, normalModuleFactory)

      compilation.dependencyFactories.set(FallbackItemDependency, normalModuleFactory)

      compilation.dependencyFactories.set(FallbackDependency, new FallbackModuleFactory())

      normalModuleFactory.hooks.factorize.tap('RemoteWebpackPlugin', (data) => {
        if (!this.isRemote(data.request)) return

        const remote = this.getRemote(data.request)
        return new RemoteModule(remote.request, remote.externalRequests, remote.internalRequest, remote.shareScope)
      })

      normalModuleFactory.hooks.factorize.tapAsync('RemoteWebpackPlugin', (data, callback) => {
        const dependency = data.dependencies[0]

        if (!this.isRemoteExternal(dependency.request)) {
          return callback()
        }

        const remoteName = this.getRemoteName(dependency.request)

        const externalModule = new ExternalModule(
          `${remoteName}@[__doer_remotes__.${remoteName}]/${this.remoteFileName}`,
          this.type,
          dependency.request,
        )
        callback(null, externalModule)
      })

      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.ensureChunkHandlers)
        .tap('RemoteWebpackPlugin', (chunk, set) => {
          set.add(RuntimeGlobals.module)
          set.add(RuntimeGlobals.moduleFactoriesAddOnly)
          set.add(RuntimeGlobals.hasOwnProperty)
          set.add(RuntimeGlobals.initializeSharing)
          set.add(RuntimeGlobals.shareScopeMap)
          compilation.addRuntimeModule(chunk, new RemoteRuntimeModule())
        })
    })
  }

  isRemote(request) {
    if (request.includes('!')) return
    return request.startsWith(this.key)
  }

  getRemote(request) {
    const [remoteName, ...rest] = request.slice(this.key.length).split('/')

    return {
      request: `${remoteName}/${rest.join('/')}`,
      externalRequests: [this.referencePath + remoteName],
      internalRequest: `./${rest.join('/')}`,
      shareScope: 'default',
    }
  }

  isRemoteExternal(request) {
    return request.startsWith(this.referencePath)
  }

  getRemoteName(request) {
    return request.slice(this.referencePath.length)
  }
}

module.exports = RemoteWebpackPlugin
