import { t } from '../locale'

/**
 * Locale access for `<script setup>` / `setup()`:
 *
 *   const { t } = useLocale()
 *   t('at.select.placeholder')
 */
export function useLocale() {
  return { t }
}

export default useLocale
