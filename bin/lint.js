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
    const parentDir = path.dirname(pathToFile.substr(0, pathToFile.length - file.length))
    pathToFile = path.join(parentDir, file)
    maxDepth--
  }

  return fs.existsSync(pathToFile) ? pathToFile : ''
}

const TSCONFIG_PATH = scanFor('tsconfig.json')
const TSLINT_PATH = scanFor('node_modules/.bin/tslint')
const ESLINT_PATH = scanFor('node_modules/.bin/eslint')
const PRETTIER_PATH = scanFor('node_modules/.bin/prettier')
const TSLINTRC_PATH = scanFor('tslint.json')
const ESLINTRC_PATH = scanFor('.eslintrc')

if (!TSLINT_PATH && !ESLINT_PATH) {
  throw new Error('Must have either eslint or tslint installed')
}

if (!PRETTIER_PATH) {
  throw new Error('Must have prettier installed')
}

if (!TSLINTRC_PATH && !ESLINTRC_PATH) {
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
  ? `${TSLINT_PATH} --project . -c ${TSLINTRC_PATH}`
  : `${ESLINT_PATH} -c ${ESLINTRC_PATH} '${directories}*.js'`
const lintPassed = exec(`${lintCommand} ${lintFixArg}`)
const prettierFixArg = argv.fix ? '--write' : '--list-different'
const prettierFiles = `${directories}*.{ts,css,scss,md,json}`
const prettierPassed = exec(`${PRETTIER_PATH} ${prettierFixArg} '${prettierFiles}'`)
process.exit(lintPassed && prettierPassed ? 0 : 1)
