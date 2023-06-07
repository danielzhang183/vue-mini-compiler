import { createArrayExpression, createCallExpression, createStringLiteral } from '../ast'
import type { Node } from '../parse'
import type { NodeTransform } from '../transform'

export const transformElement: NodeTransform = (node: Node) => {
  return () => {
    if (node.type !== 'Element')
      return

    const callExpression = createCallExpression('h', [createStringLiteral(node.tag)])
    node.children.length === 1
      ? callExpression.arguments.push(node.children[0].jsNode!)
      : callExpression.arguments.push(
        createArrayExpression(node.children.map(c => c.jsNode!)),
      )

    node.jsNode = callExpression
  }
}
