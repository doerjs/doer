import RuntimeGlobals from 'webpack/lib/RuntimeGlobals.js'
import ExternalModule from 'webpack/lib/ExternalModule.js'
import FallbackDependency from 'webpack/lib/container/FallbackDependency.js'
import FallbackItemDependency from 'webpack/lib/container/FallbackItemDependency.js'
import FallbackModuleFactory from 'webpack/lib/container/FallbackModuleFactory.js'
import RemoteModule from 'webpack/lib/container/RemoteModule.js'
import RemoteRuntimeModule from 'webpack/lib/container/RemoteRuntimeModule.js'
import RemoteToExternalDependency from 'webpack/lib/container/RemoteToExternalDependency.js'

class RemoteWebpackPlugin {
  constructor(options = {}) {
    this.remoteFileName = options.fileName || 'remote.js'
    this.remoteScopeName = options.scopeName ? `${options.scopeName}:` : 'remote:'
    this.windowScopeName = options.windowScopeName || '__scope__'
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
          `${remoteName}@[${this.windowScopeName}.${remoteName}]/${this.remoteFileName}`,
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
    return request.startsWith(this.remoteScopeName)
  }

  getRemote(request) {
    const [remoteName, ...rest] = request.slice(this.remoteScopeName.length).split('/')

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

export default RemoteWebpackPlugin
