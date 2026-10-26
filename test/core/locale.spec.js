import { afterEach, describe, expect, it } from 'vitest'
import locale, { i18n, t, use } from '../../src/locale/index.js'
import enUS from '../../src/locale/lang/en-US.js'
import zhCN from '../../src/locale/lang/zh-CN.js'
import { useLocale } from '../../src/composables/useLocale.js'
import LocaleMixin from '../../src/mixins/locale.js'

afterEach(() => {
  i18n(null)
  use(enUS)
})

describe('locale', () => {
  it('returns en-US strings without a hook', () => {
    expect(t('at.select.placeholder')).toBe('Select')
    expect(t('at.pagination.next5Text')).toBe('Next 5 Pages')
  })

  it('returns an empty string / undefined for unknown keys', () => {
    expect(t('at.nope.placeholder')).toBe('')
    expect(t('at.select.nope')).toBeUndefined()
  })

  it('uses the hook result and passes (key, values)', () => {
    const calls = []
    i18n((key, values) => {
      calls.push([key, values])
      return `hooked:${key}`
    })

    expect(t('at.select.placeholder', { n: 1 })).toBe('hooked:at.select.placeholder')
    expect(calls).toEqual([['at.select.placeholder', { n: 1 }]])
  })

  it('falls back to the language pack when the hook returns null/undefined', () => {
    i18n(key => (key === 'at.modal.okText' ? 'Ja' : undefined))

    expect(t('at.modal.okText')).toBe('Ja')
    expect(t('at.modal.cancelText')).toBe('Cancel')
  })

  it('locale.use() switches the default language', () => {
    locale.use(zhCN)
    expect(t('at.select.placeholder')).toBe(zhCN.at.select.placeholder)
    expect(t('at.select.placeholder')).not.toBe('Select')
  })

  it('exposes t via the mixin and the useLocale composable', () => {
    expect(LocaleMixin.methods.t('at.table.emptyText')).toBe('No data')
    expect(useLocale().t('at.table.emptyText')).toBe('No data')
  })
})
