/* eslint-disable max-len */
module.exports = {
  extends: 'tslint:all',
  rules: {
    // Personal configuration from eslint
    'max-line-length': [true, 100],
    'semicolon': [true, 'never'],
    'trailing-comma': [true, {multiline: 'always', singleline: 'never'}],
    'variable-name': [true, 'ban-keywords', 'check-format', 'allow-leading-underscore'],
    'quotemark': [true, 'single'],

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

    // Undecided but probably will keep
    'no-any': false,
    'max-classes-per-file': [false, 10],
    'object-literal-sort-keys': false,
    'no-shadowed-variable': false,
    'arrow-parens': false,
    'no-magic-numbers': false,
    'strict-boolean-expressions': false,
    'prefer-switch': false,
    'newline-before-return': false,
    'no-void-expression': false,

    // Disabled because they're managed by prettier
    'curly': false,
    'whitespace': false,
    'newline-per-chained-call': false,

    // Disabled because they're broken or generate incompat code
    'no-unnecessary-type-assertion': false,
    'only-arrow-functions': false,
    'promise-function-async': false,
    'no-unbound-method': false,

    // Should eventually enable
    'no-non-null-assertion': false,
    'completed-docs': [false],
  },
}
