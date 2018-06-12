const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync

const _ = require('lodash')
const log = require('debug')('lint')

const defaultConfig = require('./tslint.config.js')

const TMP_CONFIG_FILE = path.join(__dirname, '____tslint.json')
const ERROR_MESSAGE = 'could not find files necessary for tsproject'
const REQUIRED_FILES = ['node_modules/.bin/tsc', 'node_modules/.bin/tslint', 'tsconfig.json'].map(
  file => path.join(process.cwd(), file),
)

function findConfigFile() {
  let currentPath = process.cwd()
  while (currentPath.length > 5) {
    const tslintPath = path.join(currentPath, 'tslint.json')
    if (fs.existsSync(tslintPath)) {
      return tslintPath
    }
    currentPath = path.dirname(currentPath)
  }
}

function determineConfig() {
  const config = JSON.parse(JSON.stringify(defaultConfig))

  try {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    _.merge(config, pkg.tslint || (pkg.config && pkg.config.tslint))
  } catch (err) {
    log(err.stack)
  }

  return config
}

function determinteTslintOpts(paths, options) {
  const extras = []

  if (options.fix) {
    extras.push('--fix')
  }

  if (options.ignore && options.ignore.length) {
    options.ignore.forEach(f => extras.push('-e', f))
  }

  const configFile = findConfigFile() || TMP_CONFIG_FILE
  return ['--project', '.', '-c', configFile].concat(extras).concat(paths)
}

function writeConfig(config, options) {
  if (options.write) {
    const outPath = path.join(process.cwd(), 'tslint.json')
    fs.writeFileSync(outPath, JSON.stringify(config, null, 2))
  }
}

function lint(paths, options) {
  const filesExist = REQUIRED_FILES.map(file => fs.existsSync(file))
  if (filesExist.some(x => !x) && filesExist.some(x => x)) {
    return {status: 1, stderr: ERROR_MESSAGE}
  } else if (filesExist.every(x => !x)) {
    log(ERROR_MESSAGE)
    return {status: 0}
  }

  const tsConfig = determineConfig()
  const tsOptions = determinteTslintOpts(paths, options)
  const tslintPath = path.join(process.cwd(), 'node_modules/.bin/tslint')

  writeConfig(tsConfig, options)
  fs.writeFileSync(TMP_CONFIG_FILE, JSON.stringify(tsConfig))
  const results = spawn(tslintPath, tsOptions)
  try {
    fs.unlinkSync(TMP_CONFIG_FILE)
  } catch (err) {}

  log(results)
  return results
}

module.exports = lint
