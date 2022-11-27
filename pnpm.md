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

### 发布新版本

```bash
$ pnpm run pub
```

### 发布beta测试版本

```bash
$ pnpm run pre
$ pnpm run pub
$ pnpm run unpre
```