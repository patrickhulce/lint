const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawnSync

const log = require('debug')('lint')

const TMP_IGNORE_FILE = path.join(__dirname, '____prettierignore')

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
    '--ignore-path',
    TMP_IGNORE_FILE,
    '--write',
  ].concat(paths)
}

function lint(paths, options) {
  const prettierPath = findPrettierPath()
  const prettierOpts = determinePrettierOpts(paths, options)

  fs.writeFileSync(TMP_IGNORE_FILE, options.ignore.join('\n'))
  const results = spawn(prettierPath, prettierOpts)
  fs.unlinkSync(TMP_IGNORE_FILE)

  log(results)
  return results
}

module.exports = lint
