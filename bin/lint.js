#!/usr/bin/env node
const yargs = require('yargs')
const formatter = require('eslint-formatter-pretty')
const lint = require('../lib/lint.js')

const argv = yargs
  .usage('Usage: $0 [--fix] [path]')
  .option('fix', {
    describe: 'auto-fix options',
    type: 'boolean',
  })
  .argv

const report = lint(argv)
process.stdout.write(formatter(report.results))
process.exit(report.errorCount === 0 ? 0 : 1)
