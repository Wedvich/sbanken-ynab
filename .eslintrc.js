module.exports = {
  env: {
    'browser': true,
    'es6': true,
    'node': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  overrides: [
    {
      files: ['./*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error','always-multiline'],
    'indent': ['error', 2,
      {
        'SwitchCase': 1,
      }],
    'jsx-quotes': [ 'error', 'prefer-double'],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1,
        'maxEOF': 1,
        'maxBOF': 0,
      },
    ],
    'no-trailing-spaces': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
    'react': {
      version: 'detect',
    },
  },
};
