#!/usr/bin/env node

const yargs = require('yargs')
const execSync = require('child_process').execSync

const argv = yargs.usage('Usage: $0 [options]').option('fix', {
  describe: 'auto-fix problems',
  type: 'boolean',
}).argv

function exec(command) {
  try {
    execSync(command, {stdio: 'inherit'})
    return true
  } catch (err) {
    process.stderr.write(err.message + '\n')
    return false
  }
}

const lintFixArg = argv.fix ? '--fix' : ''
const lintPassed = exec(`eslint ${lintFixArg} .`)
const prettierFixArg = argv.fix ? '--write' : '--list-different'
const prettierPassed = exec(`prettier ${prettierFixArg} '**/*.{ts,css,scss,md}'`)
process.exit(lintPassed && prettierPassed ? 0 : 1)
