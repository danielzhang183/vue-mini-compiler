import { describe, expect, it } from 'vitest'
import { transform } from '../src'
import { root } from './fixtures'

describe('tokenize', () => {
  it('basic', () => {
    expect(transform(root)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "VueVue",
                    "type": "Text",
                  },
                ],
                "tag": "h1",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "TemplateTemplate",
                    "type": "Text",
                  },
                ],
                "tag": "h1",
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
