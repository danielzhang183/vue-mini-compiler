import { describe, expect, it } from 'vitest'
import { tokenize } from '../src/tokenize'

describe('tokenize', () => {
  it('basic', () => {
    const template = '<div><p>Vue</p><p>Template</p></div>'
    expect(tokenize(template)).toMatchInlineSnapshot(`
      [
        {
          "name": "div",
          "type": "tagName",
        },
        {
          "name": "p",
          "type": "tagName",
        },
        {
          "content": "Vue",
          "type": "text",
        },
        {
          "name": "p",
          "type": "tagEnd",
        },
        {
          "name": "p",
          "type": "tagName",
        },
        {
          "content": "Template",
          "type": "text",
        },
        {
          "name": "p",
          "type": "tagEnd",
        },
        {
          "name": "div",
          "type": "tagEnd",
        },
      ]
    `)
  })
})
