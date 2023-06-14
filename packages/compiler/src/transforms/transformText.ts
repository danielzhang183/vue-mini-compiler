import { NodeTypes, createObjectProperty } from '../ast'
import type { NodeTransform } from '../transform'

export const transformText: NodeTransform = (node) => {
  if (node.type !== NodeTypes.TEXT)
    return

  node.jsNode = createObjectProperty(node.content)
}
