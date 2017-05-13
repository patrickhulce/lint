const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync

const _ = require('lodash')
const log = require('debug')('lint')

const defaultConfig = require('./tslint.config.js')

const TMP_CONFIG_FILE = '____tslint.json'

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

  if (options.ignore) {
    extras.push('-e', options.ignore)
  }

  return [
    '--type-check',
    '--project',
    'tsconfig.json',
    '--config',
    TMP_CONFIG_FILE,
  ].concat(extras).concat(paths)
}

function lint(paths, options) {
  const tslintPath = path.join(process.cwd(), 'node_modules/.bin/tslint')
  if (!fs.existsSync(tslintPath)) {
    log('could not find tslint files')
    return {status: 0, stdout: ''}
  }

  const tsConfig = determineConfig()
  const tsOptions = determinteTslintOpts(paths, options)

  fs.writeFileSync(TMP_CONFIG_FILE, JSON.stringify(tsConfig))
  const results = spawn(tslintPath, tsOptions)
  fs.unlinkSync(TMP_CONFIG_FILE)

  return results
}

module.exports = lint
