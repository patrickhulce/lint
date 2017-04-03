#!/usr/bin/env node
const yargs = require('yargs')
const formatter = require('eslint-formatter-pretty')
const lint = require('../lib/lint.js')

const argv = yargs
  .usage('Usage: $0 [options] [path]')
  .option('fix', {
    describe: 'auto-fix options',
    type: 'boolean',
  })
  .option('type', {
    describe: 'type of code',
    alias: 't',
    choices: ['node', 'react'],
    default: 'node',
  })
  .argv

const paths = argv._.length ? argv._ : ['./+(lib|bin|src)/**/*.js', './*.js']
const report = lint(paths, argv)
process.stdout.write(formatter(report.results))
process.exit(report.errorCount === 0 ? 0 : 1)
