import { NodeTypes, createFunctionExpression, createReturnStatement } from '../ast'
import type { NodeTransform } from '../transform'

export const transformRoot: NodeTransform = (node) => {
  return () => {
    if (node.type !== NodeTypes.ROOT)
      return

    node.jsNode = createFunctionExpression(
      [],
      createReturnStatement(node.children[0].jsNode!),
      'render',
    )
  }
}
