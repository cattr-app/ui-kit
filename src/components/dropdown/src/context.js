import { createContext } from '../../../utils/context'

/**
 * Provided by `AtDropdown` as `reactive({ onItemClick })`. `AtDropdownItem` injects it with
 * `null` fallback and calls `onItemClick(name)`; the dropdown closes and emits
 * `on-dropdown-command` with that name.
 */
export const DropdownContext = createContext('AtDropdown')
