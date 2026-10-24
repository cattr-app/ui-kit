import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Reuse plugins/css from the library config, but drop `build` (library mode, externals):
// tests must not pick up the lib build settings.
// eslint-disable-next-line no-unused-vars
const { build, ...baseConfig } = viteConfig

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      include: ['test/**/*.spec.js'],
      globals: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,vue}'],
        exclude: ['src/stylesheet/**', 'src/locale/lang/**'],
        // json-summary + json feed the PR coverage comment in CI, lcov.info is for external tools.
        // `lcovonly` rather than `lcov`: the HTML report ships .js files that `eslint .` would lint.
        reporter: ['text-summary', 'json-summary', 'json', 'lcovonly'],
        // Write the report even when tests fail, so CI can still publish it.
        reportOnFailure: true,
        // Slightly below current coverage: catch regressions, tolerate noise.
        thresholds: {
          statements: 80,
          branches: 70,
          functions: 78,
          lines: 80,
        },
      },
    },
  }),
)
