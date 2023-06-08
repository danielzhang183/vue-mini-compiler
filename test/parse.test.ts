import { describe, expect, it } from 'vitest'
import { parse } from '../src'

describe('parse', () => {
  it.skip('basic', () => {
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
                    "jsNode": undefined,
                    "type": 2,
                  },
                ],
                "isSelfClosing": false,
                "jsNode": undefined,
                "props": [],
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
                "isSelfClosing": false,
                "jsNode": undefined,
                "props": [],
                "tag": "p",
                "type": 1,
              },
            ],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [],
            "tag": "div",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })

  it('support multiple lines', () => {
    const template = `<div>
  <p>Vue</p>
  <p>Template</p>
</div>`
    expect(parse(template)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": "
        ",
                "jsNode": undefined,
                "type": 2,
              },
              {
                "children": [
                  {
                    "content": "Vue",
                    "jsNode": undefined,
                    "type": 2,
                  },
                ],
                "isSelfClosing": false,
                "jsNode": undefined,
                "props": [],
                "tag": "p",
                "type": 1,
              },
              {
                "content": "
        ",
                "jsNode": undefined,
                "type": 2,
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": undefined,
                    "type": 2,
                  },
                ],
                "isSelfClosing": false,
                "jsNode": undefined,
                "props": [],
                "tag": "p",
                "type": 1,
              },
              {
                "content": "
      ",
                "jsNode": undefined,
                "type": 2,
              },
            ],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [],
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
