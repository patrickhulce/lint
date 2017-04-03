'use strict'
const path = require('path')

module.exports = {
  extends: path.join(__dirname, 'eslint.config.js'),
  env: {
    mocha: true,
    jest: true,
  },
  rules: {
    'no-unused-expressions': 'off',
  },
}
