module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jest',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/indent': [
      'warn',
      2,
    ],
    '@typescript-eslint/no-var-requires': 'off',
    'comma-dangle': [
      'warn',
      'always-multiline',
    ],
    'semi': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
