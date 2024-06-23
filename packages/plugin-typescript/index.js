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
        use: webpackConfigure.get('module.rules.javascript.use').clone(),
      })

      const typescript = webpackConfigure.get('module.rules.typescript')
      typescript.set('test.ts', /\.ts$/)
      typescript.set('test.tsx', /\.tsx$/)

      typescript.set('include.src', context.path.src)
      typescript.set('exclude.dts', /\.d\.ts$/)

      const babel = typescript.get('use.babel')
      const babelPresets = babel.get('options.presets')
      babelPresets.set('presetTypescript', require.resolve('@babel/preset-typescript'))
    })
  })
}
