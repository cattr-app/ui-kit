import { describe, expect, it } from 'vitest'
import {
  addClass,
  camelCaseToHyphen,
  deepCopy,
  hasClass,
  removeClass,
} from '../../src/utils/util.js'

describe('camelCaseToHyphen', () => {
  it('converts camelCase to kebab-case', () => {
    expect(camelCaseToHyphen('fooBar')).toBe('foo-bar')
    expect(camelCaseToHyphen('fooBarBaz')).toBe('foo-bar-baz')
  })

  it('lowercases and keeps already hyphenated strings', () => {
    expect(camelCaseToHyphen('Foo')).toBe('foo')
    expect(camelCaseToHyphen('foo-bar')).toBe('foo-bar')
  })
})

describe('deepCopy', () => {
  it('returns primitives as is', () => {
    expect(deepCopy(1)).toBe(1)
    expect(deepCopy('a')).toBe('a')
    expect(deepCopy(null)).toBe(null)
    expect(deepCopy(undefined)).toBe(undefined)
  })

  it('copies nested objects and arrays without sharing references', () => {
    const source = { a: 1, b: { c: [1, { d: 2 }] } }
    const copy = deepCopy(source)

    expect(copy).toEqual(source)
    expect(copy).not.toBe(source)
    expect(copy.b).not.toBe(source.b)
    expect(copy.b.c).not.toBe(source.b.c)
    expect(copy.b.c[1]).not.toBe(source.b.c[1])

    copy.b.c[1].d = 3
    expect(source.b.c[1].d).toBe(2)
  })
})

describe('hasClass / addClass / removeClass', () => {
  it('adds, detects and removes classes', () => {
    const el = document.createElement('div')

    addClass(el, 'foo bar')
    expect(el.className).toBe('foo bar')
    expect(hasClass(el, 'foo')).toBe(true)
    expect(hasClass(el, 'bar')).toBe(true)
    expect(hasClass(el, 'baz')).toBe(false)

    removeClass(el, 'foo')
    expect(hasClass(el, 'foo')).toBe(false)
    expect(hasClass(el, 'bar')).toBe(true)
  })

  it('ignores missing element or class', () => {
    const el = document.createElement('div')

    expect(hasClass(null, 'foo')).toBe(false)
    expect(hasClass(el, '')).toBe(false)
    expect(() => addClass(null, 'foo')).not.toThrow()
    expect(() => removeClass(el, '')).not.toThrow()
  })

  it('throws when hasClass gets a class with a space', () => {
    const el = document.createElement('div')
    expect(() => hasClass(el, 'foo bar')).toThrow('className should not contain space.')
  })
})
