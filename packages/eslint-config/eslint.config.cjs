require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['eslint-config-standard', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true,
      },
    ],
  },
}
