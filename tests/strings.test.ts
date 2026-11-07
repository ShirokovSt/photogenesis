import { describe, expect, it } from 'vitest'
import { en, ru } from '../src/ui/strings'

// TypeScript already checks that the keys match; lists can still differ in length
describe('translations', () => {
  it('have the same lists in both languages', () => {
    expect(ru.intro.length).toBe(en.intro.length)
    expect(ru.colors.map((c) => c.color)).toEqual(en.colors.map((c) => c.color))
    expect(ru.legend.map((l) => l.light)).toEqual(en.legend.map((l) => l.light))
  })
})
