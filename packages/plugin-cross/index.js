import { createRequire } from 'node:module'
import path from 'node:path'
import CrossWebpackPlugin from '@doerjs/cross-webpack-plugin'
import * as is from '@doerjs/utils/is.js'
import * as file from '@doerjs/utils/file.js'
import * as tool from '@doerjs/utils/tool.js'

const require = createRequire(import.meta.url)

export default function (plugin, options) {
  const pxToViewportOption = {
    unitToConvert: 'px',
    viewportWidth: 320,
    unitPrecision: 5,
    propList: ['*'],
    viewportUnit: 'vw',
    fontViewportUnit: 'vw',
    selectorBlackList: [],
    minPixelValue: 1,
    mediaQuery: false,
    replace: true,
    exclude: undefined,
    include: undefined,
    landscape: false,
    landscapeUnit: 'vw',
    landscapeWidth: 568,
    ...options,
  }

  function mobileCss(webpackConfigure) {
    const css = webpackConfigure.get('module.rules.css')
    css.set('exclude.mobileCss', /mobile\/.*\.css$/)
    css.set('exclude.mobileModuleCss', /mobile\/.*\.module\.css$/)

    webpackConfigure.set('module.rules.mobileCss', {
      test: [],
      exclude: [],
      use: css.get('use').clone(),
    })
    const mobileCss = webpackConfigure.get('module.rules.mobileCss')
    mobileCss.set('test.mobileCss', /mobile\/.*\.css$/)
    mobileCss.set('exclude.mobileModuleCss', /mobile\/.*\.module\.css$/)

    const postcssPlugin = mobileCss.get('use.postcss.options.postcssOptions.plugins')
    postcssPlugin.set('pxToViewport', [])
    postcssPlugin.set('pxToViewport.0', require.resolve('postcss-px-to-viewport'))
    postcssPlugin.set('pxToViewport.1', pxToViewportOption)
  }

  function mobileCssModule(webpackConfigure) {
    const cssModule = webpackConfigure.get('module.rules.cssModule')
    if (!cssModule.get('exclude')) {
      cssModule.set('exclude', [])
    }
    cssModule.set('exclude.mobileCssModule', /mobile\/.*\.module\.css$/)

    webpackConfigure.set('module.rules.mobileCssModule', {
      test: [],
      use: cssModule.get('use').clone(),
    })
    const mobileCssModule = webpackConfigure.get('module.rules.mobileCssModule')
    mobileCssModule.set('test.mobileCssModule', /mobile\/.*\.module\.css$/)

    const postcssPlugin = mobileCssModule.get('use.postcss.options.postcssOptions.plugins')
    postcssPlugin.set('pxToViewport', [])
    postcssPlugin.set('pxToViewport.0', require.resolve('postcss-px-to-viewport'))
    postcssPlugin.set('pxToViewport.1', pxToViewportOption)
  }

  function mobileLess(webpackConfigure) {
    const less = webpackConfigure.get('module.rules.less')
    if (!less) {
      return
    }

    less.set('exclude.mobileLess', /mobile\/.*\.less$/)
    less.set('exclude.mobileModuleLess', /mobile\/.*\.module\.less$/)

    webpackConfigure.set('module.rules.mobileLess', {
      test: [],
      exclude: [],
      use: less.get('use').clone(),
    })
    const mobileLess = webpackConfigure.get('module.rules.mobileLess')
    mobileLess.set('test.mobileLess', /mobile\/.*\.less$/)
    mobileLess.set('exclude.mobileModuleLess', /mobile\/.*\.module\.less$/)

    const postcssPlugin = mobileLess.get('use.postcss.options.postcssOptions.plugins')
    postcssPlugin.set('pxToViewport', [])
    postcssPlugin.set('pxToViewport.0', require.resolve('postcss-px-to-viewport'))
    postcssPlugin.set('pxToViewport.1', pxToViewportOption)
  }

  function mobileLessModule(webpackConfigure) {
    const lessModule = webpackConfigure.get('module.rules.lessModule')
    if (!lessModule) {
      return
    }

    if (!lessModule.get('exclude')) {
      lessModule.set('exclude', [])
    }
    lessModule.set('exclude.mobileLessModule', /mobile\/.*\.module\.less$/)

    webpackConfigure.set('module.rules.mobileLessModule', {
      test: [],
      use: lessModule.get('use').clone(),
    })
    const mobileLessModule = webpackConfigure.get('module.rules.mobileLessModule')
    mobileLessModule.set('test.mobileLessModule', /mobile\/.*\.module\.less$/)

    const postcssPlugin = mobileLessModule.get('use.postcss.options.postcssOptions.plugins')
    postcssPlugin.set('pxToViewport', [])
    postcssPlugin.set('pxToViewport.0', require.resolve('postcss-px-to-viewport'))
    postcssPlugin.set('pxToViewport.1', pxToViewportOption)
  }

  function getCrossExpose(context, filePath) {
    const { dir } = path.parse(filePath)

    const agent = path.basename(dir)
    if (!['mobile', 'pc'].includes(agent)) {
      return
    }

    const { name, dir: parentDir } = path.parse(path.parse(dir).dir)
    const item = parentDir.replace(context.path.src, '').split(path.sep).filter(Boolean)
    item.push(tool.toFirstUpperCase(name))
    item.push(agent)

    return {
      name: `./${item.join('/')}`,
      path: filePath,
    }
  }

  function replaceAlias(context, filePath) {
    const aliasName = Object.keys(context.config.alias).find((name) => {
      return filePath.startsWith(name + '/')
    })

    if (aliasName) {
      return filePath.replace(aliasName, context.config.alias[aliasName])
    }

    return filePath
  }

  const innerCrossExposes = []
  plugin.hooks.context.tap((context) => {
    plugin.hooks.eachFile.tap((filePath) => {
      if (!file.isScript(filePath)) {
        return
      }

      const expose = getCrossExpose(context, filePath)
      if (expose) {
        innerCrossExposes.push(expose)
      }
    })

    plugin.hooks.watcher.tap((watcher) => {
      watcher
        .on('add', (filePath) => {
          if (getCrossExpose(context, filePath)) {
            plugin.restart()
          }
        })
        .on('unlink', (filePath) => {
          if (getCrossExpose(context, filePath)) {
            plugin.restart()
          }
        })
    })

    plugin.hooks.webpackConfigure.tap((webpackConfigure) => {
      // 添加webpack跨端模块处理插件
      webpackConfigure.set('plugins.cross', undefined, { type: 'ClassSet', ClassObject: CrossWebpackPlugin })

      // 处理跨端模块
      const exposes = webpackConfigure.get('plugins.remote.exposes').toValue()
      const crossExpose = Object.keys(exposes).reduce((result, key) => {
        const value = exposes[key]
        if (is.isObject(value)) {
          Object.keys(value).forEach((name) => {
            result[`${key}/${name}`] = value[name]
          })
        } else {
          result[key] = value
        }

        return result
      }, {})

      const exposePaths = Object.keys(crossExpose).reduce((result, name) => {
        const exposePath = path.resolve(replaceAlias(context, crossExpose[name]))
        result[exposePath] = true
        return result
      }, {})

      innerCrossExposes.forEach((expose) => {
        if (exposePaths[expose.path]) {
          return
        }

        crossExpose[expose.name] = expose.path
      })

      webpackConfigure.set('plugins.remote.exposes', crossExpose)

      // 移动端的样式处理
      mobileCss(webpackConfigure)
      mobileCssModule(webpackConfigure)
      mobileLess(webpackConfigure)
      mobileLessModule(webpackConfigure)
    })
  })
}
