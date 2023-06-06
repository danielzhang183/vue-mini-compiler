import type { Node } from './parse'

export interface TransformContext {
  nodeTransforms: [
    transformElement: (node: Node) => void,
    transformText: (node: Node) => void,
  ]
}

export function transform(ast: Node) {
  const context: TransformContext = {
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
  if (node.type === 'Element' && node.tag === 'p')
    node.tag = 'h1'
}

function transformText(node: Node) {
  if (node.type === 'Text')
    node.content = node.content.repeat(2)
}

function traverseNode(ast: Node, context: TransformContext) {
  const currentNode = ast
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++)
    transforms[i](currentNode)

  if ('children' in currentNode) {
    const { children } = currentNode
    for (let i = 0; i < children.length; i++)
      traverseNode(children[i], context)
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
