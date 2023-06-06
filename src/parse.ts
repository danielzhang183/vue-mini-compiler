/* eslint-disable no-case-declarations */
import { tokenize } from './tokenize'

export type Node = RootNode | ElementNode | TextNode

export interface RootNode {
  type: 'Root'
  children: Node[]
}

export interface ElementNode {
  type: 'Element'
  tag: string
  children: Node[]
}

export interface TextNode {
  type: 'Text'
  content: string
}

export function parse(str: string) {
  const tokens = tokenize(str)
  const root: RootNode = {
    type: 'Root',
    children: [],
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
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode: TextNode = {
          type: 'Text',
          content: t.content!,
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
