// Pages of the documentation site, taken from its navigation (docs/router/nav.config.js).
import nav from '../../docs/router/nav.config.js'

function collect(lang) {
  const pages = []
  for (const [section, entries] of Object.entries(nav[lang])) {
    for (const entry of entries) {
      const items = entry.groups ? entry.groups.flatMap(group => group.items) : entry.items
      for (const item of items) {
        pages.push({
          lang,
          section,
          name: item.name,
          path: `/${lang}/${entry.name.toLowerCase()}/${item.name.toLowerCase()}`,
          // component pages are the ones with live demos
          demo: section === 'components' && Boolean(entry.groups),
        })
      }
    }
  }
  return pages
}

export const LANGS = Object.keys(nav)

/** Every page of every language, including the home pages. */
export const allPages = LANGS.flatMap(lang => [
  { lang, section: 'home', name: 'Home', path: `/${lang}`, demo: false },
  ...collect(lang),
])

/** Component pages with live demos (English only: the demos are the same in every language). */
export const demoPages = collect('en').filter(page => page.demo)
