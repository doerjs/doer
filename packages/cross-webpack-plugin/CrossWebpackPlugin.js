import Source from 'webpack-sources'

class CrossWebpackPlugin {
  apply(compiler) {
    compiler.hooks.make.tap('CrossWebpackPlugin', (compilation) => {
      const containerModules = []

      compilation.hooks.buildModule.tap('CrossWebpackPlugin', (module) => {
        if (module.constructor.name === 'ContainerEntryModule') {
          containerModules.push(module)
        }
      })

      compilation.hooks.afterCodeGeneration.tap('CrossWebpackPlugin', () => {
        containerModules.forEach((module) => {
          const sourceMap = compilation.codeGenerationResults.get(module).sources
          const rawSource = sourceMap.get('javascript')

          const source =
            this.getCrossCodeTemplate() + rawSource.source().replace('get: () => (get)', 'get: () => (getCross)')

          sourceMap.set('javascript', new Source.RawSource(source))
        })
      })
    })
  }

  getCrossCodeTemplate() {
    return `
    var getAgent = () => {
      if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        return 'mobile'
      }

      return 'pc'
    };
    var getCross = (module, getScope) => {
      var agent = getAgent();
      if (moduleMap[module + '/' + agent]) {
        module = module + '/' + agent;
      }

      __webpack_require__.R = getScope;
      getScope = (
        __webpack_require__.o(moduleMap, module)
          ? moduleMap[module]()
          : Promise.resolve().then(() => {
            throw new Error('Module "' + module + '" does not exist in container.');
          })
      );
      __webpack_require__.R = undefined;
      return getScope;
    };
    `
  }
}

export default CrossWebpackPlugin
