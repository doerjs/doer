# 前言

Doer是基于webpack模块联合的微前端方案，对于中小型应用仅使用单应用模式即可，对于大型项目可以利用微前端能力拆分为多个细小的子应用，利用资源整合能力，集成到同一个项目中，
该方案目前还处于实验阶段，没有大型项目做验证，请适当使用。

## 特点

* 跨项目资源引用
* 微前端能力
* 运行时布局功能
* 约定式布局
* 插件体系
* 数据mock能力
* 代码风格校验

# 快速开始

本项目开箱即用，基本无需太多的配置

## 安装

```bash
npm install --global @doerjs/cli
```

如果使用yarn
```bash
yarn global install @doerjs/cli
```

## 创建

```bash
doer create [your app name]
```

或者通过npx

```bash
npx @doerjs/cli create [your app name]
```

## 开发

```bash
cd [your app name]
doer dev
```

## 打包

```bash
cd [your app name]
doer build
```

# 项目结构

```
+-- .husky husky的配置文件
+-- public
|   +-- favicon.ico
|   +-- index.html
+-- src
|   +-- pages
|   |   +-- 404
|   |   |   +-- 404.module.css
|   |   |   +-- 404.page.jsx 404页面，路由获取不到时，会显示该页面
|   |   +-- index
|   |   |   +-- index.module.css
|   |   |   +-- index.page.jsx
|   +-- app.css
|   +-- app.js 全局脚本文件
+-- .doerrc.js 应用配置文件
+-- .env 通用环境配置
+-- .env.dev 开发环境配置
+-- .env.prod 生产环境配置
```

# 路由

该项目采用约定式路由，无需手动注册路由

约定以.page.的文件作为路由页面组件，以该页面的目录名字作为路由路径解析

例如
```
+-- index 路由路径解析为/或/index
|   +-- Index.page.jsx
```

例如
```
+-- order.list 路由路径解析为/order/list
|   +-- Order.page.jsx
```

例如
```
+-- order.$orderNo.detail 路由路径解析为/order/:orderNo/detail
|   +-- OrderDetail.page.jsx
```

例如
```
+-- order.create.wareNo$ 路由路径解析为/order/create/*wareNo
|   +-- OrderCreate.page.jsx
```

整体路由采用[React Router](https://reactrouter.com/en/main)实现路由方案

# 布局

布局方案采用与路由类似的约定规则

约定以.layout.的文件作为布局页面组件，以该布局的目录名字作为布局名称

例如
```
+-- vertical 布局名称解析为vertical
|   +-- Vertical.layout.jsx
+-- horizontal 布局名称解析为horizontal
|   +-- Horizontal.layout.jsx
```

无布局访问/order/list路由页面
http://localhost:3000/#/order/list

以vertical布局访问/order/list路由页面
http://localhost:3000/#/vertical/order/list

以horizontal布局访问/order/list路由页面
http://localhost:3000/#/horizontal/order/list

该布局方案支持运行时切换，用于适配多种场景下使用不同布局的方案

简单的布局组件
```jsx
export default function Vertical({ children }) {
  // 这里的children必须写，其他的与普通组件没有差异
  return <div>{children}</div>
}
```

# 配置

项目的配置于.doerrc.js文件中进行配置

```js
module.exports = {
  alias: {}, // 项目别名配置
  extraBabelCompileNodeModules: [], // 额外需要babel编译的node_modules包
  exposes: {}, // 项目导出的资源
  shared: {}, // 项目共享的资源配置
  browserHistory: false, // 是否开启browser router
  plugins: [], // 注册插件
  loading: '', // 注册项目的资源加载时的loading组件
  error: '', // 注册项目的资源加载失败时的error组件
}
```

## alias

设置应用资源的别名地址，参考[Webpack Alias配置](https://webpack.js.org/configuration/resolve/#resolvealias)

例如
```js
module.exports = {
  alias: {
    '@': './src'
  },
}
```

## extraBabelCompileNodeModules

该项目默认忽略了所有的node_modules的包编译，因此如果有第三方包未进行转换的，需要通过这个做配置

## exposes

改配置同[Webpack 模块联合](https://webpack.js.org/concepts/module-federation/)

```js
module.exports = {
  exposes: {
    // 导出Button组件给其他项目使用
    './Button': './src/components/button/Button.jsx',
    // 导出utils工具函数给其他项目使用
    './tool': './src/utils/tool.js',
  }
}
```

## shared

改配置同[Webpack 模块联合](https://webpack.js.org/concepts/module-federation/)

详情请查阅webpack文档

## browserHistory

是否开启[Browser Router](https://reactrouter.com/en/main/router-components/browser-router)模式

该项目默认使用HashRouter，如果需要使用Browser Router，开启本配置即可

## plugins

注册插件，详细查看[插件章节](#插件)

```js
module.exports = {
  plugins: [
    '@doerjs/plugin-less', // 官方提供的插件
    './plugins/my-plugin.js', // 项目自定义的插件
  ],
}
```

## loading

由于路由页面及布局都是动态导入的资源，因此资源加载期间，会展示一个loading的效果
该配置用于指定loading组件所在的目录，支持页面和布局统一配置，同时也支持独立配置

统一配置方式
```js
module.exports = {
  loading: './src/components/loading/Loading.jsx'
}
```

独立配置page和layout的loading组件
```js
module.exports = {
  loading: {
    layout: './src/components/loading/layout/Loading.jsx',
    page: './src/components/loading/page/Loading.jsx',
  }
}
```

## error

由于路由页面及布局都是动态导入的资源，因此资源加载期间，会展示一个error的效果
该配置用于指定error组件所在的目录，支持页面和布局统一配置，同时也支持独立配置

统一配置方式
```js
module.exports = {
  error: './src/components/error/Error.jsx'
}
```

独立配置page和layout的error组件
```js
module.exports = {
  error: {
    layout: './src/components/error/layout/Error.jsx',
    page: './src/components/error/page/Error.jsx',
  }
}
```

# API

# 环境

# 微前端

# 插件

# 部署

# 贡献代码

**准备工作**

该项目采用eslint+prettier+commitlint实现项目的规范，因此代码编辑器需要安装如下插件：

* Eslint
* Prettier - Code formatter

**如何调试本项目**

1. 首先通过npm第一次安装全局命令行工具doer
```bash
$ npm install --global @doerjs/cli
```

2. 通过doer命令创建一个应用作为example进行调试
```bash
$ doer create example
```

3. 删除package-lock.json，node_modules

4. 安装pnpm包管理工具
```bash
$ npm install --global pnpm
```

5. 添加.npmrc文件
```
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*react-dom*
public-hoist-pattern[]=*react-router-dom*
public-hoist-pattern[]=*history*
```
这个文件的作用主要解决pnpm导致间接依赖解析失败的问题

6. 执行依赖安装
```bash
$ pnpm i
```
由于之前已经配置@doerjs/cli的包路径的overrides，因此此时安装的脚手架指向了本地项目，
直接跑起来本地项目，就可以直接调试了

7. link本地脚手架
```
$ pnpm link /Volumes/Code/workspace/doer/packages/cli(这里的路径替换为你本地的真实路径)
$ 还可以link其他本地包
```

8. 运行项目
```bash
$ pnpm run dev
```

本包采用pnpm monorepo进行管理，相关命令如下

**安装依赖**

```
$ pnpm i
```

**安装全局共用的包**

```bash
$ pnpm i 包名 -w
$ pnpm i 包名 -Dw
```

**安装包到所有的子包中**

```bash
$ pnpm i 包名 -r
```

**安装包到指定的子包中**

```bash
$ pnpm i 包名 -r --filter 包名
```

**发布alpha测试版本**

是内部测试版，一般不向外部发布，会有很多Bug，一般只有测试人员使用

```bash
$ pnpm run alpha
$ pnpm run pub
$ pnpm run exit
```

**发布beta测试版本**

也是测试版，这个阶段的版本会一直加入新的功能。在Alpha版之后推出

```bash
$ pnpm run beta
$ pnpm run pub
$ pnpm run exit
```

**发布rc测试版本**

系统平台上就是发行候选版本。RC版不会再加入新的功能了，主要着重于除错

```bash
$ pnpm run rc
$ pnpm run pub
$ pnpm run exit
```

**发布正式版本**

```bash
$ pnpm run exit
$ pnpm run pub
```

# 联系作者

**邮箱**

502556093@qq.com