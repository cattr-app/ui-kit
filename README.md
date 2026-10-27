# Cattr UI

Cattr's UI component library for Vue 3 and Vite. The project is a fork of [AT UI](https://github.com/at-ui/at-ui) that keeps its API and extends the original library with the styles, theme and fixes Cattr needs.

> This is an internal Cattr library, not an official release of the original library.

## Differences from the original

- the package is published as `@amazingcat/cattr-ui` and shipped as ESM, with `vue` `^3.5` as a peer dependency;
- the package contains a prebuilt CSS (`@amazingcat/cattr-ui/style.css`) and the SCSS sources (`src/stylesheet`) for a custom theme, so no separate style package is needed;
- variables, grid, fonts and component styles are adapted to the Cattr interface;
- individual components can be imported;
- the `rowClick` event was added to table rows;
- behaviour fixes for `InputNumber`, `Tabs`, `Table` and other components used in Cattr are included.

## Installation

```bash
pnpm add @amazingcat/cattr-ui
```

## Setup

Registering the whole library:

```js
import { createApp } from 'vue'
import CattrUI from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'
import App from './App.vue'

createApp(App).use(CattrUI).mount('#app')
```

`style.css` is the prebuilt CSS with the default theme (`style.min.css` is available too); the icon fonts are pulled from the package by the bundler, so Sass is not needed for it. After that the components are available globally:

```vue
<template>
  <at-button type="primary">Save</at-button>
</template>
```

To import a single component, use its named `At*` export:

```js
import { createApp } from 'vue'
import { AtButton } from '@amazingcat/cattr-ui'
import '@amazingcat/cattr-ui/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(AtButton)
app.mount('#app')
```

Instead of `app.use(AtButton)` you can call `app.component(AtButton.name, AtButton)`.

Custom theme: instead of `style.css`, import your own SCSS entry that loads the style sources with overridden variables (`src/stylesheet/src/variables/default.scss`):

```scss
// src/styles/cattr-ui.scss
@use '@amazingcat/cattr-ui/src/stylesheet/src/index.scss' as cattr with (
  $brand-blue-500: #ff5722
);
```

```js
import './styles/cattr-ui.scss'
```

SCSS requires Sass: `pnpm add -D sass-embedded` (recommended; `sass` works too). With pnpm ≥ 10 add the following to the project's `pnpm-workspace.yaml`, otherwise `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS` because of `@parcel/watcher`:

```yaml
ignoredOptionalDependencies:
  - sass-embedded-all-unknown
  - sass-embedded-unknown-all
```

For `sass` use `allowBuilds: { '@parcel/watcher': false }` instead. See the "Styles" section of [`CHANGELOG.md`](CHANGELOG.md) for details.

Locales are imported from `@amazingcat/cattr-ui/locale/<lang>` and passed to the plugin. Available: `de`, `en-US` (default), `fa-IR`, `ko-KR`, `pt-BR`, `zh-CN`:

```js
import de from '@amazingcat/cattr-ui/locale/de'

app.use(CattrUI, { locale: de })
```

Integration with vue-i18n (version 11, `legacy: false`) through the `i18n(key, values)` hook:

```js
app.use(CattrUI, { i18n: (key, values) => i18n.global.t(key, values) })
```

If the hook returns `null` or `undefined`, the string is taken from the built-in locale. `i18n.global.t` returns the key itself for a missing key, so the fallback will not trigger; in that case check `i18n.global.te(key)` or add the `at.*` keys to the vue-i18n messages.

## Migrating from 1.x

The step-by-step list of changes with a migration checklist is in [`CHANGELOG.md`](CHANGELOG.md). The essentials:

- `v-model` works through the `modelValue` prop and the `update:modelValue` event: replace `:value` and `@input` with `:model-value` and `@update:model-value`;
- plugin installation through the global `Vue` is replaced with `app.use(...)` after `createApp`;
- the table column `render` signature changed: `render: (h, params)` became `render: ({ item, column, index })`, VNodes are written in the Vue 3 format;
- the `.native` modifier is gone: `@click.native` → `@click`.

## Development

Development uses Node.js 24 (pinned in `.nvmrc`) and pnpm (pinned in the `packageManager` field of `package.json`).

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Main commands:

| Command                | Purpose                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm dev`             | Documentation site dev server on Vite with HMR (port 7200)                                     |
| `pnpm build`           | Build the library into `dist/` (Vite, library mode, ESM) and the prebuilt CSS into `dist/css/` |
| `pnpm build:style`     | Build the styles (the `cattr-ui-style` workspace package)                                      |
| `pnpm build:docs`      | `build:style` plus the static documentation site in `dist-docs/`                               |
| `pnpm lint`            | Lint JavaScript and Vue files (ESLint)                                                         |
| `pnpm lint:fix`        | Lint and apply automatic fixes                                                                 |
| `pnpm format`          | Format files with Prettier                                                                     |
| `pnpm format:check`    | Check formatting with Prettier without changing files                                          |
| `pnpm test`            | Run the Vitest tests once                                                                      |
| `pnpm test:watch`      | Run the Vitest tests in watch mode                                                             |
| `pnpm test:coverage`   | Run the tests with a coverage report (`coverage/`)                                             |
| `pnpm test:e2e`        | Run the Playwright browser tests against the documentation site (`test/e2e/`)                  |
| `pnpm test:e2e:update` | Re-take the visual baseline (only inside the Playwright docker image, see below)               |

Documentation dev server: <http://localhost:7200/>.

### Browser tests

`test/e2e/` holds Playwright tests (Chromium only) that work through the demo pages of the documentation site:

- `smoke/` opens every docs page; a test fails on any console error, uncaught page error or `[Vue warn]` (this check is part of every e2e test, see `test/e2e/fixtures.js`);
- `components/` covers interactions that the happy-dom unit tests cannot reproduce: keyboard, click-outside and remote search with scroll loading in Select, hover/click triggers and popup positions of Dropdown/Tooltip/Popover, Escape/mask/queue of Modal and `$Modal`, Table sorting/pagination/selection, Tabs, InputNumber;
- `visual/` compares a screenshot of every component demo page with the baseline in `test/e2e/__screenshots__/`.

Playwright starts `pnpm dev` itself, or reuses a dev server that is already running (except in CI). `DOCS_PORT` changes the port (default 7200). A single suite or file is selected by path: `pnpm test:e2e smoke`, `pnpm test:e2e components/select`.

Run the tests in the Playwright docker image, the same one CI uses: browsers are not installed on the host, and font rendering differs between systems, so screenshots taken elsewhere never match. The image tag is the `@playwright/test` version from `package.json`:

```bash
docker run --rm --network host --ipc=host --user "$(id -u):$(id -g)" \
  -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 -v "$PWD":/work -w /work \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c 'mkdir -p /tmp/bin && corepack enable --install-directory /tmp/bin && PATH=/tmp/bin:$PATH pnpm test:e2e'
```

Run `pnpm install` on the host first: the container uses the same `node_modules`. Replace `pnpm test:e2e` with `pnpm test:e2e:update` to re-take the baseline after an intended visual change, and review the changed PNG files before committing them. Never update the baseline outside this image. A failed run leaves `playwright-report/` with diffs and traces (`pnpm exec playwright show-report`).

In CI the `e2e` job runs `pnpm test:e2e` in the same image and uploads `playwright-report` as an artifact when it fails. When `@playwright/test` is updated, update the image tag in `.github/workflows/ci.yml` and in the command above, then re-take the baseline.

On push to the `main` branch GitHub Actions builds the documentation and publishes it to GitHub Pages.

## Upstream and license

The project is distributed under the [MIT](LICENSE) license.
