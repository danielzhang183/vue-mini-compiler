import { describe, expect, it } from 'vitest'
import { parse } from '../src'

describe('parse tags', () => {
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
})

describe('parse attribute', () => {
  it('basic', () => {
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

  it('support multiple attributes', () => {
    const template5 = '<div id="foo" class="a"></div>'
    expect(parse(template5)).toMatchInlineSnapshot(`
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
              {
                "name": "class",
                "type": 7,
                "value": {
                  "content": "a",
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
  })
})

describe('parse interpolation', () => {
  it('basic', () => {
    const template1 = '<div>{{ abc }}</div>'
    expect(parse(template1)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": {
                  "content": "abc",
                  "type": 5,
                },
                "type": 6,
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

  it('support text & interpolation mixed mode', () => {
    const template1 = '<div>foo {{ bar }}</div>'
    expect(parse(template1)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": "foo ",
                "jsNode": undefined,
                "type": 2,
              },
              {
                "content": {
                  "content": "bar",
                  "type": 5,
                },
                "type": 6,
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

describe('parse CDATA', () => {
  it('basic', () => {
    const template1 = '<div><![CDATA[some text]]></div>'
    expect(parse(template1)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "content": "some text",
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

describe('parse Comment', () => {
  it('basic', () => {
    expect(parse('<!--abc-->')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "content": "abc",
            "type": 4,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })

  it('support multiple comments', () => {
    expect(parse('<!--abc--><!--cde-->')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "content": "abc",
            "type": 4,
          },
          {
            "content": "cde",
            "type": 4,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })

  it('support nested comments', () => {
    expect(parse('<!--!--abc-->')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "content": "!--abc",
            "type": 4,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })
})
