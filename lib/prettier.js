const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync

const log = require('debug')('lint')

const candidatePaths = [
  path.join(process.cwd(), 'node_modules/.bin/prettier'),
  path.join(__dirname, '../node_modules/.bin/prettier'),
  path.join(__dirname, '../../.bin/prettier'),
]

function findPrettierPath() {
  return candidatePaths.find(p => fs.existsSync(p))
}

function determinePrettierOpts(paths) {
  return [
    '--single-quote',
    '--no-bracket-spacing',
    '--print-width',
    '100',
    '--trailing-comma',
    'es5',
    '--write',
  ].concat(paths)
}

function lint(paths, options) {
  const prettierPath = findPrettierPath()
  const prettierOpts = determinePrettierOpts(paths, options)

  const results = spawn(prettierPath, prettierOpts)

  log(results)
  return results
}

module.exports = lint
