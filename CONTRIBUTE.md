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