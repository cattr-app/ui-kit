// Copy the compiled stylesheet into the package: src/stylesheet/css → dist/css.
// Runs after `vite build` (which empties dist/) and `pnpm build:style`, see the `build`
// script. Only at.css, at.min.css and the icon fonts are shipped: the source maps point
// at src/stylesheet/src, so they are left out together with their sourceMappingURL
// comments. at.css refers to the fonts as ./fonts/*.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const from = new URL('../src/stylesheet/css/', import.meta.url)
const to = new URL('../dist/css/', import.meta.url)

for (const file of ['at.css', 'at.min.css', 'fonts']) {
  if (!existsSync(new URL(file, from))) {
    throw new Error(`src/stylesheet/css/${file} is missing, run \`pnpm build:style\` first`)
  }
}

rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })
for (const file of ['at.css', 'at.min.css']) {
  const css = readFileSync(new URL(file, from), 'utf8')
  writeFileSync(new URL(file, to), css.replace(/\n?\/\*# sourceMappingURL=[^*]*\*\/\s*$/, '\n'))
}
cpSync(new URL('fonts/', from), new URL('fonts/', to), { recursive: true })
