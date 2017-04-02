/* eslint-disable unicorn/no-process-exit */
const path = require('path')
const CLIEngine = require('eslint').CLIEngine
const formatter = require('eslint-formatter-pretty')

function determineConfig(argv) {
  let configOverrides = {}
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    configOverrides = pkg.eslint || (pkg.config && pkg.config.eslint)
  } catch (err) {
    process.stderr.write(err.stack)
  }

  let configFile = 'eslint.config.js'
  configFile = path.resolve(__dirname, configFile)

  return Object.assign({
    ignorePattern: './**/*.test.js',
  }, configOverrides, {
    fix: argv.fix,
    configFile,
  })
}

function determineFiles(paths) {
  if (paths.length) {
    return paths
  } else {
    return ['./+(lib|bin|src)/**/*.js', './*.js']
  }
}

function lintWithOptions(files, options) {
  const engine = new CLIEngine(options)
  const report = engine.executeOnFiles(files)
  if (options.fix) {
    CLIEngine.outputFixes(report)
  }

  process.stdout.write(formatter(report.results))
  process.exit(report.errorCount === 0 ? 0 : 1)
}

function lint(argv) {
  const paths = determineFiles(argv.paths || argv._)
  const config = determineConfig(argv)
  lintWithOptions(paths, config)
}

module.exports = lint
