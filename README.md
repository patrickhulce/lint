# @patrickhulce/lint

[![NPM Package](https://img.shields.io/badge/npm-@patrickhulce/lint-brightgreen.svg)](https://www.npmjs.com/package/@patrickhulce/lint)
[![Build Status](https://travis-ci.org/patrickhulce/lint.svg?branch=master)](https://travis-ci.org/patrickhulce/lint)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/lint.svg)](https://david-dm.org/patrickhulce/lint)

Lints JavaScript and TypeScript.

## Usage

```bash
lint # lints default js+ts in src/lib/bin and test files
lint --fix # lints, fixes, and prettifies default files
lint --fix --no-prettify # lints and fixes default files
lint -t react # lints jsx in src/lib/bin and test files
lint -t typescript './stuff/**/*.ts' # lints ts in ./stuff
```
