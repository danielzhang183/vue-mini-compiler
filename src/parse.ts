/* eslint-disable no-case-declarations */
import { tokenize } from './tokenize'
import type { ElementNode, Node, RootNode, TextNode } from './ast'
import { NodeTypes, createRoot } from './ast'

export function parse(str: string) {
  const tokens = tokenize(str)
  const root = createRoot()

  // DFS
  const elementStack: Node[] = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1] as RootNode | ElementNode
    const t = tokens[0]

    switch (t.type) {
      case 'tagName':
        const elementNode: ElementNode = {
          type: NodeTypes.ElEMENT,
          tag: t.name!,
          children: [],
          jsNode: undefined,
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode: TextNode = {
          type: NodeTypes.TEXT,
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
