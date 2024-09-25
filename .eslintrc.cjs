/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "no-param-reassign": ["error"],
    'no-console': 'warn',
    'no-debugger': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        'types': {
          'Object': false,
          '{}': false
        }
      }
    ],
    'vue/multi-word-component-names': 0,
    "vue/max-attributes-per-line": "off",
    "vue/html-closing-bracket-spacing": "off",
    "vue/html-closing-bracket-newline": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/multiline-html-element-content-newline": "off",
    "vue/component-tags-order": "off",
    "vue/html-indent": "off",
    "vue/attributes-order": "off",
  },
}
