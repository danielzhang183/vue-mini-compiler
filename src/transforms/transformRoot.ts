import { NodeTypes, createFunctionExpression, createReturnStatement } from '../ast'
import type { NodeTransform } from '../transform'

export const transformRoot: NodeTransform = (node) => {
  return () => {
    if (node.type !== NodeTypes.ROOT)
      return

    const vnodeJSAST = node.children[0].jsNode
    node.jsNode = createFunctionExpression(
      [],
      undefined,
      [createReturnStatement(vnodeJSAST!)],
      'render',
    )
  }
}
