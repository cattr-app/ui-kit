// Documentation site (docs/). The library build lives in vite.config.js and is not affected.
//
//   pnpm dev         dev server with HMR on :7200
//   pnpm build:docs  static site in dist-docs/ (hash router, relative base, ready for GitHub Pages)
//
// The site imports the library straight from src/, so `pnpm build` is not needed first.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { relative } from 'node:path'
import { defineConfig } from 'vite'
import { compileTemplate } from 'vue/compiler-sfc'
import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import container from 'markdown-it-container'
import hljs from 'highlight.js'

const src = fileURLToPath(new URL('./src', import.meta.url))

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlight(code, lang) {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
  }
  return escapeHtml(code)
}

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const root = fileURLToPath(new URL('.', import.meta.url))

/**
 * The old webpack pipeline ran demos through cheerio, which silently repaired broken HTML
 * (unclosed tags etc.). The Vue 3 compiler rejects it and would fail the whole page, so a
 * demo that does not compile is replaced by an error notice and reported in the console.
 */
function checkDemo(html, env, line) {
  const { errors } = compileTemplate({ source: html, filename: env.id || 'demo', id: 'demo' })
  if (!errors.length) return null

  const messages = errors.map(e => (typeof e === 'string' ? e : e.message))
  const where = `${env.id ? relative(root, env.id) : '?'}:${line}`
  console.warn(`[docs] demo does not compile (${where}): ${messages.join('; ')}`)
  return `<div class="demo-error">Demo does not compile (${escapeHtml(where)}): ${escapeHtml(messages.join('; '))}</div>`
}

/**
 * `:::demo` + fenced block → live demo and its source:
 *
 *   <demo-box>
 *     <template #demo>…fence content without <script>…</template>
 *     <template #source-code><pre><code class="hljs …">…highlighted source…</code></pre></template>
 *   </demo-box>
 *
 * The fence inside the container is rendered by the regular `fence` rule (highlight + `hljs`
 * class below); the page-level <script> is hoisted out of the template by `markdownScripts()`.
 */
function demoContainer(md) {
  md.use(container, 'demo', {
    validate: params => /^demo\s*(.*)$/.test(params.trim()),
    render(tokens, idx, options, env = {}) {
      if (tokens[idx].nesting === 1) {
        const fence = tokens[idx + 1]
        const source = fence && fence.type === 'fence' ? fence.content.replace(SCRIPT_RE, '') : ''
        const line = tokens[idx].map ? tokens[idx].map[0] + 1 : '?'
        const html = checkDemo(source, env, line) ?? source
        return `<demo-box><template #demo>${html}</template><template #source-code>`
      }
      return '</template></demo-box>\n'
    },
  })
}

function markdownSetup(md) {
  md.renderer.rules.table_open = () => '<table class="table">'

  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (...args) =>
    fence(...args)
      .replace('<code class="', '<code class="hljs ')
      .replace('<code>', '<code class="hljs">')

  demoContainer(md)
}

/**
 * unplugin-vue-markdown hoists only `<script setup>`; the docs pages use classic
 * `<script>export default {…}</script>`, which would otherwise stay inside <template>.
 * Move such blocks after the template so the page becomes a regular SFC.
 */
function hoistClassicScripts(code) {
  const end = code.lastIndexOf('</template>')
  if (end === -1) return code

  const head = code.slice(0, end)
  const tail = code.slice(end)
  const scripts = []
  const template = head.replace(/<script(?![^>]*\bsetup\b)[^>]*>[\s\S]*?<\/script>/gi, block => {
    scripts.push(block)
    return ''
  })

  if (!scripts.length) return code

  return `${template}${tail.replace(/<script setup>\s*<\/script>/, '')}\n${scripts.join('\n')}`
}

function markdownScripts() {
  return {
    name: 'cattr-docs-markdown-scripts',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.md$/.test(id)) return null
      return { code: hoistClassicScripts(code), map: null }
    },
    handleHotUpdate(ctx) {
      if (!/\.md$/.test(ctx.file)) return
      const read = ctx.read
      ctx.read = async () => hoistClassicScripts(await read())
    },
  }
}

export default defineConfig({
  root: fileURLToPath(new URL('./docs', import.meta.url)),
  base: './',
  plugins: [
    vue({ include: [/\.vue$/, /\.md$/] }),
    Markdown({
      frontmatter: false,
      exposeFrontmatter: false,
      wrapperDiv: false,
      // the docs styles target `.at-markdown > section`
      transforms: {
        // Stray control characters (e.g. \v in color.md) used to be dropped by the old HTML
        // pipeline; the Vue 3 runtime throws on them inside attribute lists.
        before: raw => raw.replace(/[\v\f]/g, ' '),
        after: html => `<section>${html}</section>`,
      },
      markdownOptions: { html: true, linkify: false, typographer: false, highlight },
      markdownSetup,
    }),
    markdownScripts(),
  ],
  define: {
    __CATTR_UI_VERSION__: JSON.stringify(version),
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      '@amazingcat/cattr-ui': `${src}/index.js`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        // src/stylesheet still uses @import, global functions and `/` division; migrating it
        // is out of scope for the docs site, keep the dev/build console readable.
        silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'color-functions'],
      },
    },
  },
  server: {
    port: 7200,
    strictPort: true,
  },
  preview: {
    port: 7200,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-docs', import.meta.url)),
    emptyOutDir: true,
  },
})
