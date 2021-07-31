module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'preact',
    'plugin:import/errors',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
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
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unnecessary-condition': 'warn', TODO: Investigate false positives
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'arrow-parens': ['warn', 'always'],
    indent: [
      'warn',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'jsx-a11y/no-onchange': 'off',
    'jsx-quotes': ['warn', 'prefer-double'],
    'no-multiple-empty-lines': [
      'warn',
      {
        max: 1,
        maxEOF: 1,
        maxBOF: 0,
      },
    ],
    'no-trailing-spaces': 'warn',
    quotes: ['warn', 'single'],
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'require-yield': 'warn',
    semi: ['warn', 'always'],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
    react: {
      pragma: 'h',
      version: '17.0',
    },
  },
};
