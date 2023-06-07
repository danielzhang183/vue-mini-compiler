import type { ArrayExpression, CallExpression, FunctionDecl, JSNode, ReturnStatement, StringLiteral } from './ast'

export interface GenerateContext {
  code: string
  currentIndent: number
  push(code: string): void
  newline(): void
  indent(): void
  deIndent(): void
}

export function generate(node: JSNode) {
  const context: GenerateContext = {
    code: '',
    currentIndent: 0,
    push(code: string) {
      context.code += code
    },
    newline() {
      context.code += `\n${'  '.repeat(context.currentIndent)}`
    },
    indent() {
      context.currentIndent++
      context.newline()
    },
    deIndent() {
      context.currentIndent--
      context.newline()
    },
  }

  genNode(node, context)

  return context.code
}

function genNode(node: JSNode, context: GenerateContext) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break
  }
}

function genFunctionDecl(node: FunctionDecl, context: GenerateContext) {
  const { push, indent, deIndent } = context
  push(`function ${node.id.name} `)
  push('(')
  // 调用 genNodeList 为函数的参数生成代码
  genNodeList(node.params, context)
  push(') ')
  push('{')
  indent()
  // 为函数体生成代码，这里递归地调用了 genNode 函数
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push('}')
}

function genReturnStatement(node: ReturnStatement, context: GenerateContext) {
  const { push } = context
  push('return ')
  // 调用 genNode 函数递归地生成返回值代码
  genNode(node.return, context)
}

function genStringLiteral(node: StringLiteral, context: GenerateContext) {
  const { push } = context
  push(`'${node.value}'`)
}

function genCallExpression(node: CallExpression, context: GenerateContext) {
  const { push } = context
  // 取得被调用函数名称和参数列表
  const { callee, arguments: args } = node
  // 生成函数调用代码
  push(`${callee.name}(`)
  // 调用 genNodeList 生成参数代码
  genNodeList(args, context)
  push(')')
}

function genArrayExpression(node: ArrayExpression, context: GenerateContext) {
  const { push } = context
  push('[')
  genNodeList(node.elements, context)
  push(']')
}

function genNodeList(nodes: JSNode[], context: GenerateContext) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    genNode(node, context)
    if (i < nodes.length - 1)
      push(', ')
  }
}
