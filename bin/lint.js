#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const execSync = require('child_process').execSync

const argv = yargs.usage('Usage: $0 [options]').option('fix', {
  describe: 'auto-fix problems',
  type: 'boolean',
}).argv

function scanFor(file, maxDepth = 3) {
  let pathToFile = path.join(process.cwd(), file)
  while (pathToFile.length > file.length + 1 && !fs.existsSync(pathToFile) && maxDepth >= 0) {
    const parentDir = path.dirname(path.dirname(pathToFile))
    pathToFile = path.join(parentDir, file)
    maxDepth--
  }

  return fs.existsSync(pathToFile) ? pathToFile : ''
}

const TSCONFIG_PATH = scanFor('tsconfig.json')
const ESLINTRC_PATH = scanFor('.eslintrc')

if (!TSCONFIG_PATH && !ESLINTRC_PATH) {
  throw new Error('Must have either eslint or tslint config')
}

function exec(command) {
  try {
    execSync(command, {stdio: 'inherit'})
    return true
  } catch (err) {
    process.stderr.write(err.message + '\n')
    return false
  }
}

const directories = `{packages/*/,./}{src/**/,lib/**/,bin/**/,test/**/,}`

const lintFixArg = argv.fix ? '--fix' : ''
const lintCommand = TSCONFIG_PATH
  ? `tslint --project . -c ${TSCONFIG_PATH}`
  : `eslint -c ${ESLINTRC_PATH} '${directories}*.js'`
const lintPassed = exec(`${lintCommand} ${lintFixArg}`)
const prettierFixArg = argv.fix ? '--write' : '--list-different'
const prettierPassed = exec(`prettier ${prettierFixArg} '${directories}*.{ts,css,scss,md}'`)
process.exit(lintPassed && prettierPassed ? 0 : 1)
