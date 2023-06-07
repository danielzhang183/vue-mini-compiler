import type { Node } from '../parse'
import type { NodeTransform } from '../transform'

export const transformRoot: NodeTransform = (node: Node) => {
  return () => {
    if (node.type !== 'Root')
      return

    const vnodeJSAST = node.children[0].jsNode
    node.jsNode = {
      type: 'FunctionDecl',
      id: {
        type: 'Identifier',
        name: 'render',
      },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST!,
        },
      ],
    }
  }
}
