import AtButton from './components/button'
import AtButtonGroup from './components/button-group'
import AtTag from './components/tag'
import AtRadio from './components/radio'
import AtRadioGroup from './components/radio-group'
import AtRadioButton from './components/radio-button'
import AtCheckbox from './components/checkbox'
import AtCheckboxGroup from './components/checkbox-group'
import AtInput from './components/input'
import AtInputNumber from './components/input-number'
import AtTextarea from './components/textarea'
import AtBadge from './components/badge'
import AtSwitch from './components/switch'
import AtSlider from './components/slider'
import AtTooltip from './components/tooltip'
import AtPopover from './components/popover'
import AtAlert from './components/alert'
import Notification from './components/notification'
import AtProgress from './components/progress'
import LoadingBar from './components/loading-bar'
import AtModal from './components/modal'
import Dialog from './components/dialog'
import AtSelect from './components/select'
import AtOption from './components/option'
import AtOptionGroup from './components/option-group'
import AtDropdown from './components/dropdown'
import AtDropdownMenu from './components/dropdown-menu'
import AtDropdownItem from './components/dropdown-item'
import AtBreadcrumb from './components/breadcrumb'
import AtBreadcrumbItem from './components/breadcrumb-item'
import AtPagination from './components/pagination'
import Message from './components/message'
import AtMenu from './components/menu'
import AtMenuItem from './components/menu-item'
import AtMenuItemGroup from './components/menu-item-group'
import AtSubmenu from './components/submenu'
import AtTable from './components/table'
import AtCard from './components/card'
import AtCollapse from './components/collapse'
import AtCollapseItem from './components/collapse-item'
import AtSteps from './components/steps'
import AtStep from './components/step'
import AtRate from './components/rate'
import AtTabs from './components/tabs'
import AtTabPane from './components/tab-pane'
import AtTimeline from './components/timeline'
import AtTimelineItem from './components/timeline-item'
import locale from './locale'
import { CATTR_UI_KEY, setCurrentApp } from './utils/context.js'

const components = [
  AtButton,
  AtButtonGroup,
  AtTag,
  AtRadio,
  AtRadioGroup,
  AtRadioButton,
  AtCheckbox,
  AtCheckboxGroup,
  AtInput,
  AtInputNumber,
  AtTextarea,
  AtBadge,
  AtSwitch,
  AtSlider,
  AtTooltip,
  AtPopover,
  AtAlert,
  AtProgress,
  AtModal,
  AtSelect,
  AtOption,
  AtOptionGroup,
  AtDropdown,
  AtDropdownMenu,
  AtDropdownItem,
  AtBreadcrumb,
  AtBreadcrumbItem,
  AtPagination,
  AtMenu,
  AtMenuItem,
  AtMenuItemGroup,
  AtSubmenu,
  AtTable,
  AtCard,
  AtCollapse,
  AtCollapseItem,
  AtSteps,
  AtStep,
  AtRate,
  AtTabs,
  AtTabPane,
  AtTimeline,
  AtTimelineItem,
]

/* global __CATTR_UI_VERSION__ */
// Injected by `define` in vite.config.js (build and vitest); undefined when src is consumed raw.
const version = typeof __CATTR_UI_VERSION__ === 'undefined' ? undefined : __CATTR_UI_VERSION__

function install(app, opts = {}) {
  locale.use(opts.locale)
  locale.i18n(opts.i18n)

  setCurrentApp(app)
  app.provide(CATTR_UI_KEY, { app })

  for (const component of components) {
    app.component(component.name, component)
  }

  app.config.globalProperties.$Notify = Notification
  app.config.globalProperties.$Loading = LoadingBar
  app.config.globalProperties.$Modal = Dialog
  app.config.globalProperties.$Message = Message
}

const { use: setLocale, i18n } = locale

export { install, version, setLocale as locale, i18n }
export { Message, Dialog, Notification, LoadingBar }
export {
  AtButton,
  AtButtonGroup,
  AtTag,
  AtRadio,
  AtRadioGroup,
  AtRadioButton,
  AtCheckbox,
  AtCheckboxGroup,
  AtInput,
  AtInputNumber,
  AtTextarea,
  AtBadge,
  AtSwitch,
  AtSlider,
  AtTooltip,
  AtPopover,
  AtAlert,
  AtProgress,
  AtModal,
  AtSelect,
  AtOption,
  AtOptionGroup,
  AtDropdown,
  AtDropdownMenu,
  AtDropdownItem,
  AtBreadcrumb,
  AtBreadcrumbItem,
  AtPagination,
  AtMenu,
  AtMenuItem,
  AtMenuItemGroup,
  AtSubmenu,
  AtTable,
  AtCard,
  AtCollapse,
  AtCollapseItem,
  AtSteps,
  AtStep,
  AtRate,
  AtTabs,
  AtTabPane,
  AtTimeline,
  AtTimelineItem,
}

export default { install, version }
