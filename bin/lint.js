#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')
const execSync = require('child_process').execSync

const argv = yargs.usage('Usage: $0 [options]').option('fix', {
  describe: 'auto-fix problems',
  type: 'boolean',
}).argv

const IS_TYPESCRIPT =
  fs.existsSync('tsconfig.json') ||
  fs.existsSync('../tsconfig.json') ||
  fs.existsSync('../../tsconfig.json')

function exec(command) {
  try {
    execSync(command, {stdio: 'inherit'})
    return true
  } catch (err) {
    process.stderr.write(err.message + '\n')
    return false
  }
}

const directories = `?(packages/*/){src/**/,lib/**/,bin/**/,test/**/,./}`

const lintFixArg = argv.fix ? '--fix' : ''
const lintCommand = IS_TYPESCRIPT ? `tslint --project .` : `eslint ${directories}*.js`
const lintPassed = exec(`${lintCommand} ${lintFixArg}`)
const prettierFixArg = argv.fix ? '--write' : '--list-different'
const prettierPassed = exec(`prettier ${prettierFixArg} '${directories}*.{ts,css,scss,md}'`)
process.exit(lintPassed && prettierPassed ? 0 : 1)
