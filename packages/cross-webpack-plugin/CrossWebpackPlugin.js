import Source from 'webpack-sources'
import babelParser from '@babel/parser'
import babelTraverse from '@babel/traverse'
import babelGenerator from '@babel/generator'

class CrossWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('CrossWebpackPlugin', (compilation) => {
      let containerModules = []
      compilation.hooks.finishModules.tap('CrossWebpackPlugin', (modules) => {
        modules.forEach((module) => {
          if (module.constructor.name === 'ContainerEntryModule') {
            containerModules.push(module)
          }
        })
      })
      compilation.hooks.afterCodeGeneration.tap('CrossWebpackPlugin', () => {
        containerModules.forEach((module) => {
          const sourceMap = compilation.codeGenerationResults.get(module).sources
          const rawSource = sourceMap.get('javascript')

          const ast = babelParser.parse(rawSource.source(), {
            sourceType: 'module',
          })
          babelTraverse.default(ast, {
            VariableDeclarator: (path) => {
              if (path.node.id.name === 'get') {
                const node = babelParser.parse(this.generatorAgentSource())
                path.node.init.body.body.unshift(...node.program.body)
              }
            },
          })
          const source = babelGenerator.default(ast).code
          sourceMap.set('javascript', new Source.RawSource(source))
        })
        containerModules = []
      })
    })
  }

  generatorAgentSource() {
    return `
      var agent = 'pc'
      if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        agent = 'mobile'
      }

      if (moduleMap[module + '/' + agent]) {
        module = module + '/' + agent;
      }
    `
  }
}

export default CrossWebpackPlugin
