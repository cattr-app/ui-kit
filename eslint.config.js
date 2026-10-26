import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'dist-docs/**', 'coverage/**', 'node_modules/**', 'src/stylesheet/css/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
    },
  },
  {
    files: [
      'vite.config.js',
      'vite.docs.config.js',
      'vitest.config.js',
      'eslint.config.js',
      'scripts/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
]
