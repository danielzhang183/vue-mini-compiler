import { describe, expect, it } from 'vitest'
import { parse } from '../src'

describe('tokenize', () => {
  it('basic', () => {
    const template = '<div><p>Vue</p><p>Template</p></div>'
    expect(parse(template)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "type": "Text",
                  },
                ],
                "tag": "p",
                "type": "Element",
              },
            ],
            "tag": "div",
            "type": "Element",
          },
        ],
        "type": "Root",
      }
    `)
  })
})
