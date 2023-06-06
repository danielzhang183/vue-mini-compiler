import { describe, expect, it } from 'vitest'
import { parse } from '../src'
import { template } from './fixtures'

describe('parse', () => {
  it('basic', () => {
    expect(parse(template)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "jsNode": undefined,
                    "type": "Text",
                  },
                ],
                "jsNode": undefined,
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": undefined,
                    "type": "Text",
                  },
                ],
                "jsNode": undefined,
                "tag": "p",
                "type": "Element",
              },
            ],
            "jsNode": undefined,
            "tag": "div",
            "type": "Element",
          },
        ],
        "jsNode": undefined,
        "type": "Root",
      }
    `)
  })
})
