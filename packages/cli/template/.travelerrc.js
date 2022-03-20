const themes = require('./.themerc')

module.exports = {
  // 代理配置
  proxy: '',
  // 设置别名
  alias: {},
  // doer默认会排除所有node_modules编译
  // 如果需要编译部分包，请在这里添加额外的需要编译的包名
  extraBabelCompileNodeModules: [],
  // 定制antd主题包
  themes: themes,

  // 项目共享配置
  moduleFederation: {
    // 想要导出给他人用的资源
    exposes: {},
    // 引用的其他项目资源
    remotes: {},
    // 共享的第三方库
    shared: [],
  },
}
