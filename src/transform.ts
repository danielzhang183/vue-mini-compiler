import type { Node } from './parse'
import { createArrayExpression, createCallExpression, createStringLiteral } from './transformJS'

export interface TransformContext {
  currentNode: Node | null
  childIndex: number
  parent: Node | null
  replaceNode(node: Node, context: TransformContext): void
  removeNode(context: TransformContext): void
  nodeTransforms: [
    transformRoot: (node: Node) => OnExitFunction,
    transformElement: (node: Node) => OnExitFunction,
    transformText: (node: Node) => void,
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
      transformRoot,
      transformElement,
      transformText,
    ],
  }

  traverseNode(ast, context)
  return ast
}

function transformRoot(node: Node) {
  return () => {
    if (node.type !== 'Root')
      return

    const vnodeJSAST = node.children[0].jsNode
    node.jsNode = {
      type: 'FunctionDecl',
      id: {
        type: 'Identifier',
        name: 'render',
      },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJSAST!,
        },
      ],
    }
  }
}

function transformElement(node: Node) {
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

function transformText(node: Node) {
  if (node.type !== 'Text')
    return
  node.jsNode = createStringLiteral(node.content)
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
