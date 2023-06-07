/* eslint-disable no-case-declarations */
import { tokenize } from './tokenize'
import type { JSNode } from './ast'

export type Node = RootNode | ElementNode | TextNode

export interface RootNode {
  type: 'Root'
  children: Node[]
  jsNode: JSNode | undefined
}

export interface ElementNode {
  type: 'Element'
  tag: string
  children: Node[]
  jsNode: JSNode | undefined
}

export interface TextNode {
  type: 'Text'
  content: string
  jsNode: JSNode | undefined
}

export function parse(str: string) {
  const tokens = tokenize(str)
  const root: RootNode = {
    type: 'Root',
    children: [],
    jsNode: undefined,
  }

  // DFS
  const elementStack: Node[] = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1] as RootNode | ElementNode
    const t = tokens[0]

    switch (t.type) {
      case 'tagName':
        const elementNode: ElementNode = {
          type: 'Element',
          tag: t.name!,
          children: [],
          jsNode: undefined,
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode: TextNode = {
          type: 'Text',
          content: t.content!,
          jsNode: undefined,
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }

  return root
}
