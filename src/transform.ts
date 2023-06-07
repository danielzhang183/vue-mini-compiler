import type { Node } from './parse'
import { transformElement } from './transforms/transformElement'
import { transformRoot } from './transforms/transformRoot'
import { transformText } from './transforms/transformText'

export interface TransformContext {
  currentNode: Node | null
  childIndex: number
  parent: Node | null
  replaceNode(node: Node, context: TransformContext): void
  removeNode(context: TransformContext): void
  nodeTransforms: [
    transformRoot: NodeTransform,
    transformElement: NodeTransform,
    transformText: NodeTransform,
  ]
}

export type NodeTransform = (
  node: Node,
  // context: TransformContext
) => void | (() => void)

export function transform(ast: Node) {
  const context: TransformContext = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode,
    removeNode,
    nodeTransforms: [
      transformRoot,
      transformElement,
      transformText,
    ],
  }

  traverseNode(ast, context)
  return ast
}

function traverseNode(ast: Node, context: TransformContext) {
  context.currentNode = ast
  const exitFns: (() => void)[] = []
  const transforms = context.nodeTransforms

  for (let i = 0; i < transforms.length; i++) {
    const onExit = transforms[i](context.currentNode)
    if (onExit)
      exitFns.push(onExit)
    if (!context.currentNode)
      return
  }

  if ('children' in context.currentNode) {
    const { children } = context.currentNode
    for (let i = 0; i < children.length; i++) {
      context.parent = context.currentNode
      context.childIndex = i
      traverseNode(children[i], context)
    }
  }

  // exit transforms
  let i = exitFns.length
  while (i--)
    exitFns[i]()
}

function replaceNode(node: Node, context: TransformContext) {
  context.currentNode = node
  if (context.parent && 'children' in context.parent)
    context.parent.children[context.childIndex] = node
}

function removeNode(context: TransformContext) {
  if (context.parent && 'children' in context.parent) {
    context.parent.children.splice(context.childIndex, 1)
    context.currentNode = null
  }
}
