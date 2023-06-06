import type { Node } from './parse'

export interface TransformContext {
  currentNode: Node | null
  childIndex: number
  parent: Node | null
  replaceNode(node: Node, context: TransformContext): void
  removeNode(context: TransformContext): void
  nodeTransforms: [
    transformElement: (node: Node) => OnExitFunction,
    transformText: (node: Node) => OnExitFunction,
  ]
}

export type OnExitFunction = () => void

export function transform(ast: Node) {
  const context: TransformContext = {
    currentNode: null,
    childIndex: 0,
    parent: null,
    replaceNode,
    removeNode,
    nodeTransforms: [
      transformElement,
      transformText,
    ],
  }

  traverseNode(ast, context)
  console.log(dump(ast))
  return ast
}

function transformElement(node: Node) {
  return () => {
    if (node.type === 'Element' && node.tag === 'p')
      node.tag = 'h1'
  }
}

function transformText(node: Node) {
  return () => {
    if (node.type === 'Text')
      node.content = node.content.repeat(2)
  }
}

function traverseNode(ast: Node, context: TransformContext) {
  context.currentNode = ast
  const exitFns: OnExitFunction[] = []
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

function dump(node: Node, indent = 0) {
  const type = node.type
  const desc = node.type === 'Root'
    ? ''
    : node.type === 'Element'
      ? node.tag
      : node.content
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
  if ('children' in node)
    node.children.forEach(n => dump(n, indent + 2))
}
