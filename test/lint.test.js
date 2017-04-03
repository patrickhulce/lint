const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const execa = require('execa')
const copy = require('ncp').ncp
const tmp = require('tmp')

const FILE_REGEX = /\s*(\S*\.js):\d+:\d+/
const FILE_REGEX_GLOBAL = /\s*(\S*\.js):\d+:\d+/g

describe('bin/lint.js', () => {
  let tmpDir
  let results

  function readFile(dir, file) {
    dir = dir === tmpDir.name ? dir : path.join(__dirname, dir)
    return fs.readFileSync(path.join(dir, file), 'utf-8')
  }

  function parseResult(result) {
    const content = result.stdout
      .split('\n')
      .filter(s => s.trim())
      .join('\t')
      .trim()

    if (!content.match(FILE_REGEX)) {
      return {files: [], byFile: {}}
    }

    const files = content
      .match(FILE_REGEX_GLOBAL)
      .map(item => item.match(FILE_REGEX)[1])
    const fileResults = files
      .map((file, index) => {
        const start = content.indexOf(file) + file.length
        let end = content.indexOf(files[index + 1])
        end = end === -1 ? undefined : end
        const rules = content.slice(start, end)
        return {file, rules}
      })

    return {files, byFile: _.keyBy(fileResults, 'file')}
  }

  function diffDirectories(dirA, dirB) {

  }

  function setup(dir, args, beforeLint, done) {
    if (arguments.length === 3) {
      done = beforeLint
      beforeLint = _.noop
    }

    tmpDir = tmp.dirSync({unsafeCleanup: true})
    copy(path.join(__dirname, dir), tmpDir.name, err => {
      if (err) {
        return done(err)
      }

      beforeLint()
      execa(path.join(__dirname, '../bin/lint.js'), args, {cwd: tmpDir.name})
        .catch(result => result)
        .then(result => results = Object.assign(result, parseResult(result)))
        .then(() => done())
    })
  }

  function teardown(done, copyBack) {
    const finish = err => {
      if (tmpDir) {
        tmpDir.removeCallback()
      }

      tmpDir = null
      done(err)
    }

    if (copyBack) {
      copy(tmpDir.name, path.join(__dirname, copyBack), finish)
    } else {
      finish()
    }
  }

  context('node', () => {
    before(done => setup('fixtures/node', ['--fix'], done))
    after(teardown)

    describe('linting', () => {
      it('should exit with error code', () => {
        expect(results.code).to.equal(1)
      })

      it('should find errors in ./', () => {
        expect(results.files).to.contain('toplevel.js')
      })

      it('should find errors in lib/', () => {
        expect(results.files).to.contain('lib/file.js')
      })

      it('should find errors in src/', () => {
        expect(results.files).to.contain('src/file.js')
      })

      it('should find errors in bin/', () => {
        expect(results.files).to.contain('bin/file.js')
      })
    })

    describe('--fix', () => {
      it('should fix errors', () => {
        const original = readFile('fixtures/node-expected', 'lib/file.js')
        const output = readFile(tmpDir.name, 'lib/file.js')
        expect(original).to.equal(output)
      })
    })
  })

  describe('package.json overrides', () => {
    function beforeLint() {
      fs.writeFileSync(path.join(tmpDir.name, 'package.json'), JSON.stringify({
        config: {
          eslint: {
            envs: ['browser'],
            globals: ['__DEV__'],
            rules: {'no-console': 'off'},
          }
        }
      }, null, 2), 'utf-8')
    }

    before(done => setup('fixtures/node-overrides', [], beforeLint, done))
    after(teardown)

    it('should still lint', () => {
      expect(results.byFile).to.have.property('file.js')
      const violations = results.byFile['file.js'].rules
      expect(violations).to.contain('Extra semicolon')
    })

    it('should respect overrides', () => {
      expect(results.byFile).to.have.property('file.js')
      const violations = results.byFile['file.js'].rules
      expect(violations).to.not.contain('document is not defined')
      expect(violations).to.not.contain('__DEV__ is not defined')
      expect(violations).to.not.contain('Unexpected console')
    })
  })

  context('react', () => {
    before(done => setup('fixtures/react', ['-t', 'react', '--fix'], done))
    after(done => teardown(done, 'fixtures/react-actual'))

    describe('linting', () => {
      it('should find react-specific errors', () => {
        expect(results.byFile).to.have.property('file.js')
        const violations = results.byFile['file.js'].rules
        expect(violations).to.contain('prop is never used')
        expect(violations).to.contain('key must begin with handle')
        expect(violations).to.contain('Link is not defined')
      })

      it('should use webpack resolution', () => {
        expect(results.byFile).to.have.property('file.js')
        const violations = results.byFile['file.js'].rules
        expect(violations).to.not.contain('Unable to resolve path to module src/dep2')
      })
    })

    describe('--fix', () => {
      it('should fix errors', () => {
        const original = readFile('fixtures/react-expected', 'file.js')
        const output = readFile(tmpDir.name, 'file.js')
        expect(original).to.equal(output)
      })
    })
  })
})
