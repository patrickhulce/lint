#!/usr/bin/env node
const yargs = require('yargs')
const debug = require('debug')
const formatter = require('eslint-formatter-pretty')
const lint = require('../lib/lint.js')
const tslint = require('../lib/tslint.js')
const prettier = require('../lib/prettier.js')

const log = debug('lint')

const argv = yargs
  .usage('Usage: $0 [options] [path]')
  .option('fix', {
    describe: 'auto-fix options',
    type: 'boolean',
  })
  .option('prettify', {
    describe: 'prettifies files in place, only applies when --fix is used',
    type: 'boolean',
    default: true,
  })
  .option('type', {
    describe: 'type of code',
    alias: 't',
    choices: ['node', 'react', 'test', 'typescript'],
    default: 'node',
  })
  .option('write', {
    describe: 'write out the config',
    type: 'boolean',
  })
  .argv

function prettifyIfNecessary(paths, options) {
  if (!options.fix || !options.prettify) {
    return
  }

  const results = prettier(paths, options)
  if (results.status === 0) {
    const stdout = results.stdout.toString()
    const filesProcessed = stdout
      .split('\n')
      .map(s => s.match(/(.*) \d+ms$/))
      .filter(Boolean)
      .map(parts => parts[1])
    for (const file of filesProcessed) {
      process.stdout.write(`- ${file}\n`)
    }

    process.stdout.write(`✅  ${filesProcessed.length} files prettified\n\n`)
  } else if (results.status === 2) {
    log('no matching files detected for prettifying')
  } else {
    log(results.stderr.toString())
  }
}

function run(paths, options) {
  prettifyIfNecessary(paths, options)
  const report = lint(paths, options)
  process.stdout.write(formatter(report.results))
  return report.errorCount === 0
}

function tsrun(paths, options) {
  prettifyIfNecessary(paths, options)
  const results = tslint(paths, options)
  if (results.status !== 0 && results.stdout) {
    process.stdout.write(results.stdout)
  }

  if (results.stderr && results.stderr.length) {
    process.stderr.write(results.stderr)
  }

  return results.status === 0
}

function exit(passed) {
  process.exit(passed ? 0 : 1)
}

if (argv._.length) {
  const runFunc = argv.type === 'typescript' ? tsrun : run
  exit(runFunc(argv._, argv))
} else {
  const srcIgnore = '**/*.test.js'
  const srcOpts = Object.assign({}, argv, {ignore: srcIgnore})
  const srcPassed = run(['./+(lib|bin|src)/**/*.js', './*.js'], srcOpts)

  const testIgnore = '**/fixtures/**/*.test.js'
  const testOpts = Object.assign({}, argv, {type: 'test', write: false, ignore: testIgnore})
  const testPassed = run(['./+(lib|bin|src|test)/**/*.test.js'], testOpts)

  const tsIgnore = '**/*.d.ts'
  const tsOpts = Object.assign({}, argv, {ignore: tsIgnore})
  const tsPassed = tsrun(['./+(lib|bin|src)/**/*.ts'], tsOpts)

  exit(srcPassed && testPassed && tsPassed)
}

