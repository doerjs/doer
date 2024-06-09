module.exports = {
  extends: [
    require.resolve('./eslint.config.cjs'),
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
  ],
}
