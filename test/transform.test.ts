import { describe, expect, it } from 'vitest'
import { transform } from '../src'
import { root } from './fixtures'

describe('transform', () => {
  it('basic', () => {
    expect(transform(root)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "content": "Vue",
                    "jsNode": {
                      "type": "StringLiteral",
                      "value": "Vue",
                    },
                    "type": "Text",
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p",
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Vue",
                    },
                  ],
                  "callee": {
                    "name": "h",
                    "type": "Identifier",
                  },
                  "type": "CallExpression",
                },
                "tag": "p",
                "type": "Element",
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": {
                      "type": "StringLiteral",
                      "value": "Template",
                    },
                    "type": "Text",
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": "StringLiteral",
                      "value": "p",
                    },
                    {
                      "type": "StringLiteral",
                      "value": "Template",
                    },
                  ],
                  "callee": {
                    "name": "h",
                    "type": "Identifier",
                  },
                  "type": "CallExpression",
                },
                "tag": "p",
                "type": "Element",
              },
            ],
            "jsNode": {
              "arguments": [
                {
                  "type": "StringLiteral",
                  "value": "div",
                },
                {
                  "elements": [
                    {
                      "arguments": [
                        {
                          "type": "StringLiteral",
                          "value": "p",
                        },
                        {
                          "type": "StringLiteral",
                          "value": "Vue",
                        },
                      ],
                      "callee": {
                        "name": "h",
                        "type": "Identifier",
                      },
                      "type": "CallExpression",
                    },
                    {
                      "arguments": [
                        {
                          "type": "StringLiteral",
                          "value": "p",
                        },
                        {
                          "type": "StringLiteral",
                          "value": "Template",
                        },
                      ],
                      "callee": {
                        "name": "h",
                        "type": "Identifier",
                      },
                      "type": "CallExpression",
                    },
                  ],
                  "type": "ArrayExpression",
                },
              ],
              "callee": {
                "name": "h",
                "type": "Identifier",
              },
              "type": "CallExpression",
            },
            "tag": "div",
            "type": "Element",
          },
        ],
        "jsNode": {
          "body": [
            {
              "return": {
                "arguments": [
                  {
                    "type": "StringLiteral",
                    "value": "div",
                  },
                  {
                    "elements": [
                      {
                        "arguments": [
                          {
                            "type": "StringLiteral",
                            "value": "p",
                          },
                          {
                            "type": "StringLiteral",
                            "value": "Vue",
                          },
                        ],
                        "callee": {
                          "name": "h",
                          "type": "Identifier",
                        },
                        "type": "CallExpression",
                      },
                      {
                        "arguments": [
                          {
                            "type": "StringLiteral",
                            "value": "p",
                          },
                          {
                            "type": "StringLiteral",
                            "value": "Template",
                          },
                        ],
                        "callee": {
                          "name": "h",
                          "type": "Identifier",
                        },
                        "type": "CallExpression",
                      },
                    ],
                    "type": "ArrayExpression",
                  },
                ],
                "callee": {
                  "name": "h",
                  "type": "Identifier",
                },
                "type": "CallExpression",
              },
              "type": "ReturnStatement",
            },
          ],
          "id": {
            "name": "render",
            "type": "Identifier",
          },
          "params": [],
          "type": "FunctionDecl",
        },
        "type": "Root",
      }
    `)
  })
})
