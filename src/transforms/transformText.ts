import { createStringLiteral } from '../ast'
import type { Node } from '../parse'
import type { NodeTransform } from '../transform'

export const transformText: NodeTransform = (node: Node) => {
  if (node.type !== 'Text')
    return
  node.jsNode = createStringLiteral(node.content)
}
