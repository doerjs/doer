### 准备工作
该项目采用eslint+prettier+commitlint实现项目的规范，因此代码编辑器需要安装如下插件：

* Eslint
* Prettier - Code formatter

### 如何调试本项目（这种调试方式还有问题）

1. 首先通过npm第一次安装全局命令行工具doer
```bash
$ npm install --global @doerjs/cli
```

2. 通过doer命令创建一个应用作为example进行调试
```bash
$ doer create example
```

3. 修改example中的package.json文件新增如下内容
```json
{
  ...其他原本的信息,
  "pnpm": {
    "overrides": {
      "@doerjs/cli": "link:../doer/packages/cli"(备注，这里的地址是你doer项目的绝对地址或者相对地址)
    }
  }
}
```

4. 删除package-lock.json，node_modules

5. 安装pnpm包管理工具
```bash
$ npm install --global pnpm
```

6. 执行依赖安装
```bash
$ pnpm i
```
由于之前已经配置@doerjs/cli的包路径的overrides，因此此时安装的脚手架指向了本地项目，
直接跑起来本地项目，就可以直接调试了

7. 运行项目
```bash
$ doer dev
```

本包采用pnpm monorepo进行管理

### 安装依赖

```
$ pnpm i
```

### 安装全局共用的包

```bash
$ pnpm i 包名 -w
$ pnpm i 包名 -Dw
```

### 安装包到所有的子包中

```bash
$ pnpm i 包名 -r
```

### 安装包到指定的子包中

```bash
$ pnpm i 包名 -r --filter 包名
```

### 基于pnpm如何调试本地包

目标项目的package.json文件中重写路径为本地路径
```json
{
  "pnpm": {
    "overrides": {
      "@doerjs/cli": "link:../doer/packages/cli"
    }
  }
}
```

### 发布alpha测试版本

是内部测试版，一般不向外部发布，会有很多Bug，一般只有测试人员使用

```bash
$ pnpm run alpha
$ pnpm run pub
$ pnpm run exit
```

### 发布beta测试版本

也是测试版，这个阶段的版本会一直加入新的功能。在Alpha版之后推出

```bash
$ pnpm run beta
$ pnpm run pub
$ pnpm run exit
```

### 发布rc测试版本

系统平台上就是发行候选版本。RC版不会再加入新的功能了，主要着重于除错

```bash
$ pnpm run rc
$ pnpm run pub
$ pnpm run exit
```

### 发布正式版本

```bash
$ pnpm run exit
$ pnpm run pub
```