import { createContext } from '../../../utils/context'

/**
 * Provided by `AtBreadcrumb` as `reactive({ separator })` (prop unwrapped from `toRef`).
 * `AtBreadcrumbItem` injects it with `null` fallback and uses the default `/` without a parent.
 */
export const BreadcrumbContext = createContext('AtBreadcrumb')
