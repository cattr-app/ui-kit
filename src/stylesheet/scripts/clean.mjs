// Prepare css/: remove the previous build and copy the icon fonts next to at.css
// (src/core/font.scss refers to them as ./fonts/*). Replaces rimraf + copyfiles.
import { cpSync, rmSync } from 'node:fs'

const root = new URL('../', import.meta.url)

rmSync(new URL('css/', root), { recursive: true, force: true })
cpSync(new URL('src/core/fonts/', root), new URL('css/fonts/', root), { recursive: true })
