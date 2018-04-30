/* eslint-disable max-len */
module.exports = {
  extends: 'tslint:all',
  rules: {
    // Personal configuration from eslint
    'max-line-length': [true, {'limit': 100, 'ignore-pattern': '^import |//'}],
    'semicolon': [true, 'never'],
    'trailing-comma': [true, {multiline: 'always', singleline: 'never'}],
    'variable-name': [true, 'ban-keywords', 'check-format', 'allow-leading-underscore'],
    'quotemark': [true, 'single', 'jsx-double', 'avoid-escape'],

    // Personal typescript options
    'align': [true, 'members', 'statements', 'elements'],
    'typedef': [
      true,
      'call-signature',
      'parameter',
      'property-declaration',
      'member-variable-declaration',
    ],
    'member-ordering': [
      true,
      {
        order: [
          'static-field',
          'instance-field',
          'constructor',
          'instance-method',
          'static-method',
        ],
      },
    ],
    'comment-format': [true, 'check-space'],
    'no-empty': [true, 'allow-empty-catch'],

    // Could conditionally enable
    'max-classes-per-file': [false, 10],
    'completed-docs': [false],
    'no-magic-numbers': false,
    'no-shadowed-variable': false,

    // Disabled because it's incovenient
    'arrow-parens': false,
    'return-undefined': false,
    'no-parameter-reassignment': false,
    'prefer-switch': false,

    // Disabled because it's unnecessarily limiting
    'no-any': false,
    'strict-boolean-expressions': false,
    'newline-before-return': false,
    'no-non-null-assertion': false,
    'no-void-expression': false,
    'object-literal-sort-keys': false,
    'prefer-function-over-method': false,

    // Disabled because they're broken or generate incompat code
    'no-unnecessary-type-assertion': false,
    'only-arrow-functions': false,
    'promise-function-async': false,
    'no-unbound-method': false,

    // Disabled because they're managed by prettier
    'curly': false,
    'whitespace': false,
    'newline-per-chained-call': false,
  },
}
