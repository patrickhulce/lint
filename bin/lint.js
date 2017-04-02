#!/usr/bin/env node
const path = require('path')
const yargs = require('yargs')
const CLIEngine = require('eslint').CLIEngine
const formatter = require('eslint-formatter-pretty')

const argv = yargs
  .usage('Usage: $0 [--fix] [path]')
  .option('fix', {
    describe: 'auto-fix options',
    type: 'boolean',
  })
  .argv

let pkgConfig = {}
try {
  const pkg = require(path.join(process.cwd(), 'package.json'))
  pkgConfig = pkg.eslint || (pkg.config && pkg.config.eslint)
} catch (err) {
  process.stderr.write(err.stack)
}

let configFile = 'eslint.config.js'
configFile = path.resolve(__dirname, `../lib/${configFile}`)

const config = Object.assign({
  fix: argv.fix,
  ignorePattern: './**/*.test.js',
  configFile,
}, pkgConfig)

const paths = argv._
if (paths.length === 0) {
  paths.push('./+(lib|bin|src)/**/*.js', './*.js')
}

const engine = new CLIEngine(config)
const report = engine.executeOnFiles(argv._)
if (argv.fix) {
  CLIEngine.outputFixes(report)
}

process.stdout.write(formatter(report.results))
process.exit(report.errorCount === 0 ? 0 : 1)
