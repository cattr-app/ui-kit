import LoadingBarClass from './src/loading-bar.js'
import { getCurrentApp, setCurrentApp } from '../../utils/context.js'

const HIDE_DELAY = 800

let loadingBarInstance = null
let width = 2
let timer = null
let hideTimer = null

function getLoadingBarInstance() {
  loadingBarInstance = loadingBarInstance || new LoadingBarClass({ width })
  return loadingBarInstance
}

function update(options) {
  getLoadingBarInstance().update(options)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function hide() {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    hideTimer = null
    destroy()
  }, HIDE_DELAY)
}

function destroy() {
  clearTimer()
  clearHideTimer()
  if (!loadingBarInstance) return
  loadingBarInstance.destroy()
  loadingBarInstance = null
}

const LoadingBar = {
  start() {
    if (timer) return
    // A pending hide from a previous finish()/error() must not remove the new bar.
    clearHideTimer()

    let percent = 0

    update({
      percent,
      status: 'success',
      show: true,
    })

    timer = setInterval(() => {
      percent += Math.floor(Math.random() * 3 + 5)
      if (percent > 95) {
        clearTimer()
      }
      update({
        percent,
        status: 'success',
        show: true,
      })
    }, 200)
  },
  update(percent) {
    clearTimer()
    clearHideTimer()
    update({
      percent,
      status: 'success',
      show: true,
    })
  },
  finish() {
    clearTimer()
    update({
      percent: 100,
      status: 'success',
      show: true,
    })
    hide()
  },
  error() {
    clearTimer()
    update({
      percent: 100,
      status: 'error',
      show: true,
    })
    hide()
  },
  config(options = {}) {
    if (options.width) {
      width = options.width
      loadingBarInstance?.update({ width })
    }
  },
  /** Remove the bar immediately and stop all timers. */
  destroy,
}

// Standalone `app.use(LoadingBar)` (without CattrUI): render the service in this app's context.
LoadingBar.install = app => {
  if (!getCurrentApp()) setCurrentApp(app)
  app.config.globalProperties.$Loading = LoadingBar
}

export default LoadingBar
