#!/usr/bin/env node
const yargs = require('yargs')
const lint = require('../lib/lint.js')

const argv = yargs
  .usage('Usage: $0 [--fix] [path]')
  .option('fix', {
    describe: 'auto-fix options',
    type: 'boolean',
  })
  .argv

lint(argv)
