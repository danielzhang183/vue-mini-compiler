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
                      "type": 7,
                      "value": "Vue",
                    },
                    "type": 2,
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": 7,
                      "value": "p",
                    },
                    {
                      "type": 7,
                      "value": "Vue",
                    },
                  ],
                  "callee": "h",
                  "type": 6,
                },
                "tag": "p",
                "type": 1,
              },
              {
                "children": [
                  {
                    "content": "Template",
                    "jsNode": {
                      "type": 7,
                      "value": "Template",
                    },
                    "type": 2,
                  },
                ],
                "jsNode": {
                  "arguments": [
                    {
                      "type": 7,
                      "value": "p",
                    },
                    {
                      "type": 7,
                      "value": "Template",
                    },
                  ],
                  "callee": "h",
                  "type": 6,
                },
                "tag": "p",
                "type": 1,
              },
            ],
            "jsNode": {
              "arguments": [
                {
                  "type": 7,
                  "value": "div",
                },
                {
                  "elements": [
                    {
                      "arguments": [
                        {
                          "type": 7,
                          "value": "p",
                        },
                        {
                          "type": 7,
                          "value": "Vue",
                        },
                      ],
                      "callee": "h",
                      "type": 6,
                    },
                    {
                      "arguments": [
                        {
                          "type": 7,
                          "value": "p",
                        },
                        {
                          "type": 7,
                          "value": "Template",
                        },
                      ],
                      "callee": "h",
                      "type": 6,
                    },
                  ],
                  "type": 8,
                },
              ],
              "callee": "h",
              "type": 6,
            },
            "tag": "div",
            "type": 1,
          },
        ],
        "jsNode": {
          "body": [
            {
              "returns": {
                "arguments": [
                  {
                    "type": 7,
                    "value": "div",
                  },
                  {
                    "elements": [
                      {
                        "arguments": [
                          {
                            "type": 7,
                            "value": "p",
                          },
                          {
                            "type": 7,
                            "value": "Vue",
                          },
                        ],
                        "callee": "h",
                        "type": 6,
                      },
                      {
                        "arguments": [
                          {
                            "type": 7,
                            "value": "p",
                          },
                          {
                            "type": 7,
                            "value": "Template",
                          },
                        ],
                        "callee": "h",
                        "type": 6,
                      },
                    ],
                    "type": 8,
                  },
                ],
                "callee": "h",
                "type": 6,
              },
              "type": 10,
            },
          ],
          "id": {
            "name": "render",
            "type": 3,
          },
          "params": [],
          "returns": undefined,
          "type": 9,
        },
        "type": 0,
      }
    `)
  })
})
