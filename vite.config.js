import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const src = fileURLToPath(new URL('./src', import.meta.url))

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const localeEntries = Object.fromEntries(
  readdirSync(`${src}/locale/lang`)
    .filter(file => file.endsWith('.js'))
    .map(file => [`locale/${file.slice(0, -3)}`, `${src}/locale/lang/${file}`]),
)

export default defineConfig({
  plugins: [vue()],
  define: {
    __CATTR_UI_VERSION__: JSON.stringify(version),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: `${src}/index.js`,
        ...localeEntries,
      },
      formats: ['es'],
      fileName: (format, name) => `${name}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        preserveModules: false,
      },
    },
  },
})
