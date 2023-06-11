import { describe, expect, it } from 'vitest'
import { parse } from '../src'

describe('parse tags', () => {
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
                  "constType": 0,
                  "content": "abc",
                  "isStatic": false,
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
                  "constType": 0,
                  "content": "bar",
                  "isStatic": false,
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

describe.only('parse directive', () => {
  it('directive with value', () => {
    expect(parse('<template v-if="ok"></template>')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [
              {
                "name": "v-if",
                "type": 7,
                "value": {
                  "content": "ok",
                  "jsNode": undefined,
                  "type": 2,
                },
              },
            ],
            "tag": "template",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })

  it('v-on shorthand', () => {
    expect(parse('<template @click="handler"></template>')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [
              {
                "arg": {
                  "constType": 3,
                  "content": "click",
                  "isStatic": true,
                  "type": 5,
                },
                "exp": {
                  "constType": 0,
                  "content": "handler",
                  "isStatic": false,
                  "type": 5,
                },
                "modifiers": [],
                "name": "on",
                "type": 8,
              },
            ],
            "tag": "template",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })

  it('v-bind .prop shorthand', () => {
    expect(parse('<div .a=b />')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": true,
            "jsNode": undefined,
            "props": [
              {
                "arg": {
                  "constType": 3,
                  "content": "a",
                  "isStatic": true,
                  "type": 5,
                },
                "exp": {
                  "constType": 0,
                  "content": "b",
                  "isStatic": false,
                  "type": 5,
                },
                "modifiers": [
                  "prop",
                ],
                "name": "bind",
                "type": 8,
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

  it('v-bind shorthand with modifier', () => {
    expect(parse('<div :a.sync=b />')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": true,
            "jsNode": undefined,
            "props": [
              {
                "arg": {
                  "constType": 3,
                  "content": "a",
                  "isStatic": true,
                  "type": 5,
                },
                "exp": {
                  "constType": 0,
                  "content": "b",
                  "isStatic": false,
                  "type": 5,
                },
                "modifiers": [
                  "sync",
                ],
                "name": "bind",
                "type": 8,
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

  it('slot element', () => {
    const ast = parse('<slot></slot>')
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "isSelfClosing": false,
            "jsNode": undefined,
            "props": [],
            "tag": "slot",
            "type": 1,
          },
        ],
        "jsNode": undefined,
        "type": 0,
      }
    `)
  })
})
