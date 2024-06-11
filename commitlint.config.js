export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能开发
        'fix', // 问题修复
        'hotfix', // 线上问题修复
        'docs', // 文档
        'style', // 样式改动，不影响主功能
        'refactor', // 代码的重构
        'test', // 测试代码
        'chore', // 构建过程或辅助工具的变动
        'revert', // 提交记录回退
        'merge', // 分支合并，修复冲突
        'release', // 发布版本
      ],
    ],
  },
}
