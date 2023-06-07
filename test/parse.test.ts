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
                    "type": 2,
                  },
                ],
                "jsNode": undefined,
                "tag": "p",
                "type": 1,
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": undefined,
                    "type": 2,
                  },
                ],
                "jsNode": undefined,
                "tag": "p",
                "type": 1,
              },
            ],
            "jsNode": undefined,
            "tag": "div",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })
})
