import type { ParentNode, RootNode, TemplateChildNode } from './ast'
import { NodeTypes } from './ast'
import { transformElement } from './transforms/transformElement'
import { transformRoot } from './transforms/transformRoot'
import { transformText } from './transforms/transformText'

export interface TransformContext {
  currentNode: RootNode | TemplateChildNode | null
  childIndex: number
  parent: ParentNode | null
  replaceNode(node: TemplateChildNode): void
  removeNode(): void
  nodeTransforms: [
    transformRoot: NodeTransform,
    transformElement: NodeTransform,
    transformText: NodeTransform,
  ]
}

export type NodeTransform = (
  node: RootNode | TemplateChildNode,
  // context: TransformContext
) => void | (() => void)

export function createTransformContext(): TransformContext {
  const context: TransformContext = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode(node: TemplateChildNode) {
      context.currentNode = node
      if (context.parent && 'children' in context.parent)
        context.parent.children[context.childIndex] = node
    },
    removeNode() {
      if (context.parent && 'children' in context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformRoot,
      transformElement,
      transformText,
    ],
  }

  return context
}

export function transform(root: RootNode) {
  const context = createTransformContext()
  traverseNode(root, context)
  return root
}

function traverseNode(node: RootNode | TemplateChildNode, context: TransformContext) {
  context.currentNode = node
  const exitFns: (() => void)[] = []
  const { nodeTransforms } = context

  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node)
    if (onExit)
      exitFns.push(onExit)

    if (!context.currentNode)
      return
    else
      node = context.currentNode
  }

  switch (node.type) {
    case NodeTypes.ROOT:
    case NodeTypes.ElEMENT:
      traverseChildren(node, context)
  }

  // exit transforms
  context.currentNode = node
  let i = exitFns.length
  while (i--)
    exitFns[i]()
}

function traverseChildren(parent: ParentNode, context: TransformContext) {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]
    context.parent = parent
    context.childIndex = i
    traverseNode(child, context)
  }
}
