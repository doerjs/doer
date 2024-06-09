import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default function (plugin) {
  plugin.hooks.context.tap((context) => {
    plugin.hooks.webpackConfigure.tap((webpackConfigure) => {
      const extensions = webpackConfigure.get('resolve.extensions')
      extensions.set('ts', '.ts')
      extensions.set('tsx', '.tsx')

      const routerExtensions = webpackConfigure.get('plugins.router.extensions')
      routerExtensions.set('ts', '.ts')
      routerExtensions.set('tsx', '.tsx')

      const sourcemap = webpackConfigure.get('module.rules.sourcemap')
      if (sourcemap) {
        sourcemap.set('test.ts', /\.ts$/)
        sourcemap.set('test.tsx', /\.tsx$/)
      }

      webpackConfigure.set('module.rules.typescript', {
        test: [],
        resolve: {
          fullySpecified: false,
        },
        include: context.config.extraBabelCompileNodeModules,
        exclude: [],
        use: [],
      })

      const typescript = webpackConfigure.get('module.rules.typescript')
      typescript.set('test.ts', /\.ts$/)
      typescript.set('test.tsx', /\.tsx$/)

      typescript.set('include.src', context.path.src)
      typescript.set('exclude.dts', /\.d\.ts$/)

      typescript.set('use.babel', {
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          presets: [],
          plugins: [],
          browserslistEnv: process.env.NODE_ENV,
          compact: process.env.NODE_ENV === 'production',
          sourceMaps: true,
          inputSourceMap: true,
        },
      })

      const babel = typescript.get('use.babel')

      const babelPresets = babel.get('options.presets')
      babelPresets.set('presetEnv', [])
      babelPresets.set('presetEnv.0', require.resolve('@babel/preset-env'))
      babelPresets.set('presetEnv.1', {
        useBuiltIns: false,
        loose: false,
        debug: false,
      })
      babelPresets.set('presetReact', require.resolve('@babel/preset-react'))

      const babelPlugins = babel.get('options.plugins')
      babelPlugins.set('transformRuntime', [])
      babelPlugins.set('transformRuntime.0', require.resolve('@babel/plugin-transform-runtime'))
      babelPlugins.set('transformRuntime.1', {
        corejs: 3,
        helpers: true,
        regenerator: true,
      })
    })
  })
}
