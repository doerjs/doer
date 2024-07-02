import RuntimeGlobals from 'webpack/lib/RuntimeGlobals.js'
import ExternalModule from 'webpack/lib/ExternalModule.js'
import FallbackDependency from 'webpack/lib/container/FallbackDependency.js'
import FallbackItemDependency from 'webpack/lib/container/FallbackItemDependency.js'
import FallbackModuleFactory from 'webpack/lib/container/FallbackModuleFactory.js'
import RemoteModule from 'webpack/lib/container/RemoteModule.js'
import RemoteRuntimeModule from 'webpack/lib/container/RemoteRuntimeModule.js'
import RemoteToExternalDependency from 'webpack/lib/container/RemoteToExternalDependency.js'
import SharePlugin from 'webpack/lib/sharing/SharePlugin.js'
import ContainerEntryDependency from 'webpack/lib/container/ContainerEntryDependency.js'
import ContainerEntryModuleFactory from 'webpack/lib/container/ContainerEntryModuleFactory.js'
import ContainerExposedDependency from 'webpack/lib/container/ContainerExposedDependency.js'
import { parseOptions } from 'webpack/lib/container/options.js'

class RemoteWebpackPlugin {
  constructor(options = {}) {
    this.name = options.name
    this.shared = options.shared
    this.exposes = parseOptions(
      options.exposes,
      (item) => ({
        import: Array.isArray(item) ? item : [item],
        name: undefined,
      }),
      (item) => ({
        import: Array.isArray(item.import) ? item.import : [item.import],
        name: item.name || undefined,
      }),
    )
    this.shareScope = 'default'
    this.remoteFileName = options.filename || 'remote.js'
    this.remoteScopeName = options.scopeName ? `${options.scopeName}:` : 'remote:'
    this.windowScopeName = options.windowScopeName || '__scope__'
    this.library = { type: 'var', name: options.name }
    this.type = 'script'
    this.referencePath = 'webpack/container/reference/'
  }

  apply(compiler) {
    if (!compiler.options.output.enabledLibraryTypes.includes(this.library.type)) {
      compiler.options.output.enabledLibraryTypes.push(this.library.type)
    }

    const remotes = []

    compiler.hooks.afterPlugins.tap('RemoteWebpackPlugin', () => {
      compiler.hooks.make.tapAsync('RemoteWebpackPlugin', (compilation, callback) => {
        const dep = new ContainerEntryDependency(this.name, this.exposes, this.shareScope)
        dep.loc = { name: this.name }
        compilation.addEntry(
          compilation.options.context,
          dep,
          {
            name: this.name,
            filename: this.remoteFileName,
            library: this.library,
          },
          (error) => {
            if (error) return callback(error)
            callback()
          },
        )
      })

      compiler.hooks.thisCompilation.tap('RemoteWebpackPlugin', (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(ContainerEntryDependency, new ContainerEntryModuleFactory())
        compilation.dependencyFactories.set(ContainerExposedDependency, normalModuleFactory)
      })

      compiler.hooks.compilation.tap('RemoteWebpackPlugin', (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(RemoteToExternalDependency, normalModuleFactory)

        compilation.dependencyFactories.set(FallbackItemDependency, normalModuleFactory)

        compilation.dependencyFactories.set(FallbackDependency, new FallbackModuleFactory())

        normalModuleFactory.hooks.factorize.tap('RemoteWebpackPlugin', (data) => {
          if (!this.isRemote(data.request)) return

          remotes.push(data.request)
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

      if (this.shared) {
        new SharePlugin({
          shared: this.shared,
          shareScope: this.shareScope,
        }).apply(compiler)
      }
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
      shareScope: this.shareScope,
    }
  }

  isRemoteExternal(request) {
    return request.startsWith(this.referencePath)
  }

  getRemoteName(request) {
    const remoteName = request.slice(this.referencePath.length)
    return remoteName === 'self' ? this.name : remoteName
  }
}

export default RemoteWebpackPlugin
