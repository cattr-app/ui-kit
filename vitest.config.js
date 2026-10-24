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
        reporter: ['text', 'text-summary'],
      },
    },
  }),
)
