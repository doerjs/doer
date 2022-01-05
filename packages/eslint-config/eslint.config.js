module.exports = {
  extends: ['standard'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
  },
}
