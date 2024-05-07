/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'prettier/prettier': 'off',
    'indent': ['error', 2],
    'semi':['error'],
    'quotes':['error', 'single'],
    'eol-last': ['error'],
    'eqeqeq':['error'],
    'no-var':['error'],
    'camelcase':['error'],
    'comma-spacing':['error'],
    'comma-style': [2, 'last'],
    'prefer-const': ['error'],
    'keyword-spacing': ['error'],
    'no-undef': ['off'],
    'no-async-promise-executor': ['off'],
    'no-undefined': ['error'],
    'no-global-assign': ['error'],
    'no-shadow-restricted-names': ['error']
  }, 'parserOptions': {
    'ecmaVersion': 7,
    'sourceType': 'module'
  }
};
