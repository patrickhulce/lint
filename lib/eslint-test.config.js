'use strict'
const path = require('path')

module.exports = {
  extends: path.join(__dirname, 'eslint.config.js'),
  env: {
    mocha: true,
    jest: true,
  },
  plugins: ['react'],
  rules: {
    'import/no-unresolved': 'off',
    'no-unused-expressions': 'off',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
}
