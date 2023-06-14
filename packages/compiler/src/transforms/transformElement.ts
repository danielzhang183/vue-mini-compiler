import { NodeTypes, createArrayExpression, createCallExpression, createObjectProperty } from '../ast'
import type { NodeTransform } from '../transform'

export const transformElement: NodeTransform = (node) => {
  return () => {
    if (node.type !== NodeTypes.ELEMENT)
      return

    const callExpression = createCallExpression<string>('h', [createObjectProperty(node.tag)])
    node.children.length === 1
      ? callExpression.arguments.push(node.children[0].jsNode!)
      : callExpression.arguments.push(
        createArrayExpression(node.children.map(c => c.jsNode!)),
      )

    node.jsNode = callExpression
  }
}
