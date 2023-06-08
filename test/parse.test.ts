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

  it('support self-closing tag', () => {
    const template = '<img />'
    expect(parse(template)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": true,
            "jsNode": undefined,
            "props": [],
            "tag": "img",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
    const template2 = '<div><img /></div>'
    expect(parse(template2)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [],
                "isSelfClosing": true,
                "jsNode": undefined,
                "props": [],
                "tag": "img",
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

  it('support parse attribute', () => {
    const template1 = '<div id="foo"></div>'
    const template2 = '<div id=\'foo\'></div>'
    const template3 = '<div id=foo></div>'
    const template4 = '<div id= foo ></div>'
    const result = parse(template1)
    expect(result).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [
              {
                "name": "id",
                "type": 7,
                "value": {
                  "content": "foo",
                  "jsNode": undefined,
                  "type": 2,
                },
              },
            ],
            "tag": "div",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
    expect(parse(template2)).toEqual(result)
    expect(parse(template3)).toEqual(result)
    expect(parse(template4)).toEqual(result)
  })
})
