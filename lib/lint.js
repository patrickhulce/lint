const path = require('path')
const log = require('debug')('lint')
const CLIEngine = require('eslint').CLIEngine

function determineConfig(argv) {
  let configOverrides = {}
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    configOverrides = pkg.eslint || (pkg.config && pkg.config.eslint)
  } catch (err) {
    log(err.stack)
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
  return report
}

function lint(argv) {
  const paths = determineFiles(argv.paths || argv._)
  const config = determineConfig(argv)
  return lintWithOptions(paths, config)
}

module.exports = lint
