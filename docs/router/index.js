import { createRouter, createWebHashHistory } from 'vue-router'
import NavConfig from './nav.config.js'
import { preferredLang } from '../i18n.js'

const pages = import.meta.glob('../markdown/**/*.md')
const views = import.meta.glob('../views/*.vue')

function lazy(modules, path) {
  const loader = modules[path]
  if (!loader) throw new Error(`[docs router] missing page ${path}`)
  return loader
}

function view(name, lang) {
  return lazy(views, `../views/${name}${lang === 'zh' ? '' : `-${lang}`}.vue`)
}

function registerRoutes() {
  const parentRoutes = {}

  function addRoute(parentName, item, lang) {
    parentRoutes[`${parentName}-${lang}`].children.push({
      path: item.name.toLowerCase(),
      name: `${item.name}-${lang}`,
      component: lazy(pages, `../markdown/${lang}/${item.name.toLowerCase()}.md`),
    })
  }

  Object.keys(NavConfig).forEach(lang => {
    const pageNavs = NavConfig[lang]

    for (const pageName in pageNavs) {
      pageNavs[pageName].forEach(nav => {
        const parentName = nav.name
        const key = `${parentName}-${lang}`

        parentRoutes[key] = parentRoutes[key] || {
          path: `/${lang}/${parentName.toLowerCase()}`,
          component: view(parentName.toLowerCase(), lang),
          children: [],
        }

        if (nav.groups) {
          nav.groups.forEach(group => group.items.forEach(item => addRoute(parentName, item, lang)))
        } else if (nav.items) {
          nav.items.forEach(item => addRoute(parentName, item, lang))
        }
      })
    }
  })

  return Object.values(parentRoutes)
}

// Default child of each section: `/zh/docs` → first page. Route names: Docs, Docs-en, Guide, …
const sectionNames = {
  '/zh/guide': 'Guide',
  '/en/guide': 'Guide-en',
  '/zh/docs': 'Docs',
  '/en/docs': 'Docs-en',
  '/zh/resource': 'Resource',
  '/en/resource': 'Resource-en',
}

const routes = registerRoutes()

routes.forEach(page => {
  const name = sectionNames[page.path]
  if (name) {
    page.children.push({ path: '', name, redirect: { name: page.children[0].name } })
  }
})

const userLang = preferredLang()

routes.push(
  {
    path: '/zh',
    name: 'Home',
    component: lazy(views, '../views/index.vue'),
  },
  {
    path: '/en',
    name: 'Home-en',
    component: lazy(views, '../views/index-en.vue'),
  },
  {
    path: '/',
    redirect: { name: userLang === 'zh' ? 'Home' : `Home-${userLang}` },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Home' },
  },
)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash }
    }

    return { top: 0 }
  },
})

export default router
