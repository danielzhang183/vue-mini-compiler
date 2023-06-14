import { describe, expect, it } from 'vitest'
import { compile } from '../src'
import { template } from './fixtures'

describe('compiler', () => {
  it('basic', () => {
    expect(compile(template)).toMatchInlineSnapshot(`
      "function render () {
        return h('div', [h('p', 'Vue'), h('p', 'Template')])
      }"
    `)
  })
})
