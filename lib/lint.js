const fs = require('fs')
const path = require('path')

const _ = require('lodash')
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

function writeConfig(config, options) {
  if (!options.write) {
    return
  }

  const baseConfig = require(config.configFile)
  const finalConfig = _.merge(baseConfig, _.omit(config, 'configFile'))
  const outPath = path.join(process.cwd(), '.eslintrc')
  fs.writeFileSync(outPath, JSON.stringify(finalConfig, null, 2))
}

function lint(paths, options) {
  const config = determineConfig(options)
  writeConfig(config, options)

  const engine = new CLIEngine(config)
  const report = engine.executeOnFiles(paths)
  if (config.fix) {
    CLIEngine.outputFixes(report)
  }
  return report
}

module.exports = lint
