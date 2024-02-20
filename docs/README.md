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
  mode: 'project', // project项目 library库
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

目前api分为两部分，一部分是在项目根目录下的app.js文件中导出，一部分是挂载载window.doer对象上

## remotes()

支持异步方式

```js
// app.js文件

export function remotes() {
  return {
    app1: 'http://app1host'
  }
}
```
该函数主要用于注册微前端应用的域名，可以通过接口返回或者写死

## render(oldRender)

自定义render逻辑

```js
// app.js文件
import LocaleProvider from '...'

export function render(oldRender) {
  oldRender((children) => {
    return (
      <LocaleProvider>
        {children}
      </LocaleProvider>
    )
  })
}
```

## enter()

应用进入时触发的函数

```js
// app.js文件

export function enter() {}
```

## leave()

应用离开时触发的函数

```js
// app.js文件

export function leave() {}
```

## history

路由操作对象

```js
window.doer.history
```

# 工具

## loadRemoteModule(scope, module)

加载远程资源

```js
import { loadRemoteModule } from 'doer'

// 举个例子，我们有远程项目lib, 需要加载./utils以及./components/Input

// 加载远程资源
const module = await loadRemoteModule('lib', './utils')()

// 加载组件
const Component = React.lazy(() => loadRemoteModule('lib', './components/Input'))
```

## share(key, context)

共享资源，调用该函数可以把对应资源共享到全局

```js
import { share } from 'doer'

share('plugin', {})
```

## apply(key)

获取共享的资源，调用该函数可以消费对应的共享资源

```js
import { apply } from 'doer'

const plugin = apply('plugin')
console.log(plugin)
// 控制台打印：{}
```

# 环境

项目的环境变量通过项目根目录下的.env文件进行写入，目前内置了如下环境

* dev: 开发环境，执行```npm run dev```时自动添加该环境变量
* prod: 打包环境，执行```npm run build```时自动添加该环境变量

优先级如下：

.env < .env.local < .env.[环境] < .env.[环境].local

**自定义环境**

以添加自定义mock环境为例

```package.json```
```json
{
  "scripts": {
    "mock": "ENV=mock doer dev"
  }
}
```

然后新增.env.mock环境变量文件即可

注：要支持mock能力，需要配合mock插件进行，请查看[mock插件](#插件)

**可用环境变量**

| 名称 | 可用模式 | 描述 | 默认值 |
| :- | :- | :- | :- |
| IMAGE_INLINE_LIMIT_SIZE | 通用 | 图片资源内联最大限制 | 10000 |
| PUBLIC_URL | 通用 | 静态资源路径 | / |
| ROOT_ELEMENT_ID | 通用 | 挂载的根节点ID | root |
| HOST | 开发 | 开发服务器的域名 | 0.0.0.0 |
| PORT | 开发 | 开发服务器的端口 | 3000 |
| HTTPS | 开发 | 开启https | false |
| HTTPS_KEY | 开发 | 开发服务器的证书key | 无 |
| HTTPS_CERT | 开发 | 开发服务器的证书cert | 无 |
| ENABLE_PROFILER | 生产 | 开启性能分析 | false |
| GZIP | 生产 | 开启GZIP | false |
| ENABLE_ANALYZER | 生产 | 开启分包大小分析 | false |

**自定义环境变量**

需要以```APP_```打头，该类型的变量会被解析并通过webpack的definePlugin注入到应用中，应用可以通过process.env.APP_xxx进行访问

# 微前端

本项目基于webpack的模块联合机制打造的微前端能力，支持跨项目页面访问，跨项目资源访问等能力

**跨项目页面访问**

假如你有一个壳应用main，两个子应用sub1, sub2(目前这些应用都是需由doer脚手架生成，其他老项目接入需要单独改造)
你需要在main应用下访问sub1，和 sub2应用的页面，此时只需要按如下步骤进行：

1. 在main应用中的app.js文件里的[remotes](#remotes)函数中注册应用的域名
2. 按```http://main.com/#/sub1/page``` ```http://main.com/#/sub2/page``` 即可访问到子应用的页面
3. 如果main应用需要以名为layout的布局进行访问, ```http://main.com/#/layout/sub1/page```

访问规则如下：http://[host]/#/[?布局]/[?应用]/[路由]，布局和应用没有时可以不需要

**跨项目资源共享**

假如你有一个通用组件项目components，该项目主要用于向其他项目提供公共组件资源，此时你可以通过[exposes](#exposes)配置导出相关资源

其他项目在引用时无需额外配置可以直接按如下方式使用
```js
import Button from 'remote:components/Button'
```

# 插件

通过[插件配置](#plugins)进行插件的使用

## plugin-less

配置支持less文件编译

```bash
npm install @doerjs/plugin-less
```

```js
module.exports = {
  plugins: ['@doerjs/plugin-less'],
}
```

## plugin-mock

配置支持开发模式下的数据mock能力

```bash
npm install @doerjs/plugin-mock
```

```js
module.exports = {
  plugins: ['@doerjs/plugin-mock'],
}
```

**mock插件新增的可用环境变量**

| 名称 | 可用模式 | 描述 | 默认值 |
| :- | :- | :- | :- |
| MOCK | 开发 | 开启数据mock | false |
| MOCK_DELAY | 开发 | mock接口的响应延迟 | 0 |
| MOCK_SERVER_PREFIX | 开发 | mock接口的统一前缀 | /mock |

**mock文件的存放路径**

在项目的根目录下/mocks目录

**如何编写mock服务**

```js
// mocks/demo.js

export default {
  'GET /mock/jsonDemo': {
    code: '200',
    data: {},
  },

  'POST /mock/funcDemo': function (req, res) {
    return res.status(200).json({
      code: '200',
      data: {},
    })
  },
}
```

整体mock服务基于express搭建，遵循express语法即可

## plugin-typescript

配置支持ts，如果通过脚手架初始化时选择ts，此插件及tsconfig.json会自动加入

```bash
npm install @doerjs/plugin-typescript
```

```js
module.exports = {
  plugins: ['@doerjs/plugin-typescript'],
}
```

## 自定义插件开发

由于相关api较多，这里不列举出来，如需开发自定义插件，请参考现有插件源码及```packages/cli/lib/Plugin.js```中查看对应的插件hooks以及其调用时机

# 部署

部署方式与其他前端应用没有差别，值得注意的一点是微前端应用场景下，每个应用都存在一个remote.js文件，缓存时应设置为不缓存

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
$ pnpm i 依赖包 -r --filter 包
```

**发布alpha测试版本**

是内部测试版，一般不向外部发布，会有很多Bug，一般只有测试人员使用

```bash
$ pnpm run alpha
$ pnpm run version
$ pnpm run pub
$ pnpm run exit
```

**发布beta测试版本**

也是测试版，这个阶段的版本会一直加入新的功能。在Alpha版之后推出

```bash
$ pnpm run beta
$ pnpm run version
$ pnpm run pub
$ pnpm run exit
```

**发布rc测试版本**

系统平台上就是发行候选版本。RC版不会再加入新的功能了，主要着重于除错

```bash
$ pnpm run rc
$ pnpm run version
$ pnpm run pub
$ pnpm run exit
```

**发布正式版本**

```bash
$ pnpm run exit
$ pnpm run version
$ pnpm run pub
```

# 联系作者

**邮箱**

502556093@qq.com