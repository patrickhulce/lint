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
    describe: 'prettifies files in place',
    type: 'boolean',
    default: false,
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
  .option('ignore', {
    describe: 'patterns of files to ignore',
    type: 'array',
  }).argv

function prettifyIfNecessary(paths, options) {
  if (!options.prettify) {
    return
  }

  const results = prettier(paths, options)
  const stdout = results.stdout.toString()
  if (results.status === 0) {
    const filesProcessed = stdout
      .split('\n')
      .map(s => s.match(/(.*) \d+ms$/))
      .filter(Boolean)
      .map(parts => parts[1])
    for (const file of filesProcessed) {
      process.stdout.write(`  - ${file}\n`)
    }

    process.stdout.write(`  ✅  ${filesProcessed.length} files prettified\n\n`)
  } else if (results.status === 1) {
    const files = stdout
      .split('\n')
      .map(s => s && s.trim())
      .filter(Boolean)

    for (const file of files) {
      process.stdout.write(`  - ${file}\n`)
    }
    process.stdout.write(`  ✖  ${files.length} files were not pretty\n\n`)
  } else {
    const stderr = results.stderr.toString()
    const isKnownError = /No matching files/.test(stderr)
    if (isKnownError) {
      log('prettier', {stdout, stderr})
    } else {
      process.stdout.write(stdout)
      process.stderr.write(stderr)
    }
  }
}

function run(paths, options) {
  if (options.type === 'typescript') {
    return true
  }

  prettifyIfNecessary(paths, options)
  const report = lint(paths, options)
  process.stdout.write(formatter(report.results))
  return report.errorCount === 0
}

function tsrun(paths, options) {
  prettifyIfNecessary(paths, Object.assign({prettierParser: 'typescript'}, options))
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
  const srcIgnore = ['**/*.test.js'].concat(argv.ignore)
  const srcOpts = Object.assign({}, argv, {ignore: srcIgnore})
  const srcPassed = run(['./+(lib|bin|src)/**/*.js', './*.js'], srcOpts)

  const testIgnore = ['**/fixtures/**/*.test.js'].concat(argv.ignore)
  const testOpts = Object.assign({}, argv, {type: 'test', write: false, ignore: testIgnore})
  const testPassed = run(['./+(lib|bin|src|test)/**/*.test.js'], testOpts)

  const tsIgnore = ['**/*.d.ts'].concat(argv.ignore)
  const tsOpts = Object.assign({}, argv, {ignore: tsIgnore})
  const tsPassed = tsrun(['./+(lib|bin|src)/**/*.ts'], tsOpts)

  exit(srcPassed && testPassed && tsPassed)
}
