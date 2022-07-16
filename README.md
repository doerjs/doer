
# Doer

该项目目前还缺乏真实场景考验，仅处于玩具阶段

TODO

[ ] 支持browser history
[ ] ts支持在创建的时候选择对应选项
[ ] less支持创建的时候选择对应选项
[ ] debug为空的场景

## 特点

* 代码风格检查
* mock服务
* css module + less支持
* 约定式目录路由，路由级别的按需加载
* 运行时布局切换，无需在开发过程中为页面指定固定布局，运行时可随时切换布局，方便多场景使用
* 运行时跨项目切换，基于webpack模块联合
* 跨项目资源引用，也是基于webpack模块联合

### 约定式路由

想法来源于：https://gist.github.com/jamiebuilds/86d467ee4353cb316edce8e69ad19237
实现了大多数功能，未实现部分个人不是很认同的地方

比如有如下目录结构：
.
+-- src/pages

|   +-- Order -> 对应的路由 /order
|   |   +-- Order.page.jsx

|   +-- Order.Detail -> 对应的路由 /order/detail
|   |   +-- Detail.page.jsx

|   +-- Order.$orderId.Detail -> 对应的路由 /order/:orderId/detail
|   |   +-- Detail.page.jsx

|   +-- Order.Detail.orderId$ -> 对应的路由 /order/detail/*orderId
|   |   +-- Detail.page.jsx

通过.page.确定当前目录文件作为路由页面，为了坚持平铺的直观感受，不支持嵌套写法，仅pages下第一层目录生效

### 约定式布局

.
+-- src/layouts

|   +-- Index // 标准布局
|   |   +-- Index.layout.jsx

|   +-- Full // 全屏布局
|   |   +-- Full.layout.jsx

|   +-- Vertical // 水平布局
|   |   +-- Vertical.layout.jsx

| ...可以写任意名称的布局组件仅需满足下方案例即可
|

通过.layout.确定当前目录文件作为路由页面，为了坚持平铺的直观感受，不支持嵌套写法，仅layouts下第一层目录生效

```jsx
// 一个最简单的布局写法
import React from 'react'

export default function Index({ children }) {
  return <div>{{children}}</div>
}
```

#### 布局切换

// 无布局访问地址
http://localhost:3000/#/order

// 标准布局访问地址
http://localhost:3000/#/index/order

// 全屏布局访问地址
http://localhost:3000/#/full/order

其他布局访问方式类似，支持运行时快速切换， 无需重新发布

### 微前端

#### 跨项目页面访问

支持项目独立运行，独立部署

比如基于doer创建如下两个项目

App1:

http://localhost:3000/#/index/order

App2:

http://localhost:4000/#/index/order/detail

假设我们需要在app1中访问app2的order/detail页面，这个时候无需重新编译app1和app2

直接访问如下地址即可：
http://localhost:3000/#/index/@app2/order/detail

这个时候布局index用的是http://localhost:3000该域名指向的app1中的资源，页面访问的是order/detail

#### 跨项目资源引用（组件，函数等）

假设App2中共享了

一个组件资源 Demo.jsx
一个工具函数 tool.js

对应的配置
```js
// .doerrc.js

module.exports = {
  ...其他配置

  exposes: {
    './Demo': './src/components/Demo/Demo.jsx',
    './tool': './src/utils/tool.js',
  },
}
```

这时候我们需要在App1项目中使用，无需任何配置，通过以下写法即可直接使用

```jsx
import React, { useEffect } from 'react'
// 跨项目引用函数
import { test } from 'remote:app1/tool'
// 跨项目引用组件
const Demo = React.lazy(() => import('remote:app1/Demo'))

export default function() {
  useEffect(() => {
    test()
  }, [])

  return (
    <div>
      <Demo></Demo>
    </div>
  )
}
```

### 创建应用

```bash
$ doer create app1
```

![image.png](https://upload-images.jianshu.io/upload_images/12992535-8c8aaad2c0fb0ab3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 启动应用

```bash
$ cd app1
$ npm install
$ npm run dev
```
![image.png](https://upload-images.jianshu.io/upload_images/12992535-85cdc8dbd6f0f737.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 打包应用

```bash
$ npm run build
```

## examples

如果你对本项目感兴趣，可以通过脚手架自行创建项目或者使用项目中的examples

examples/app1

http://localhost:3000

examples/app2

http://locahost:4000

![image.png](https://upload-images.jianshu.io/upload_images/12992535-61766f17415856e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/12992535-5ad9eeedd5a8fbaa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/12992535-ec8bbe30c3713ff5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)