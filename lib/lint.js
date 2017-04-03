const path = require('path')
const log = require('debug')('lint')
const CLIEngine = require('eslint').CLIEngine

const CONFIG_FILES = {
  node: 'eslint.config.js',
  react: 'eslint-react.config.js',
  test: 'eslint-test.config.js',
}

function determineConfig(options) {
  let configOverrides = {}
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    configOverrides = pkg.eslint || (pkg.config && pkg.config.eslint)
  } catch (err) {
    log(err.stack)
  }

  return Object.assign({}, configOverrides, {
    fix: options.fix,
    ignorePattern: options.ignore,
    configFile: path.resolve(__dirname, CONFIG_FILES[options.type]),
  })
}

function lint(paths, options) {
  const config = determineConfig(options)
  const engine = new CLIEngine(config)
  const report = engine.executeOnFiles(paths)
  if (config.fix) {
    CLIEngine.outputFixes(report)
  }
  return report
}

module.exports = lint
