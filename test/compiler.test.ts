import { describe, expect, it } from 'vitest'
import { compile } from '../src'

describe('compiler', () => {
  it('basic', () => {
    const template = '<div><p>Vue</p><p>Template</p></div>'
    expect(compile(template)).toMatchInlineSnapshot(`
      "function render () {
        return h('div', [h('p', 'Vue'), h('p', 'Template')])
      }"
    `)
  })
})
