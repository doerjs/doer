const themes = require('./.themerc')

module.exports = {
  // 设置别名
  alias: {},
  // doer默认会排除所有node_modules编译
  // 如果需要编译部分包，请在这里添加额外的需要编译的包名
  extraBabelCompileNodeModules: [],
  // 定制antd主题包
  themes: themes,

  // 自定义<Suspense fallback={<Loading />}> loading组件
  // 布局加载和页面加载公用一个loading
  // loading: './src/components/loading'
  // 或者 分别指定加载组件
  // loading: {
  //   layout: './src/layouts/loading',
  //   page: './src/components/loading',
  // },

  // 项目导出的共享资源
  exposes: {
    './Demo': './src/components/Demo/Demo.jsx',
    './tool': './src/utils/tool.js',
  },
  shared: {},
}
