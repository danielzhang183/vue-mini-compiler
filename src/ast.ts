export interface StringLiteral {
  type: 'StringLiteral'
  value: string
}

export interface Identifier {
  type: 'Identifier'
  name: string
}

export interface CallExpression {
  type: 'CallExpression'
  callee: Identifier
  arguments: JSNode[]
}

export interface ArrayExpression {
  type: 'ArrayExpression'
  elements: JSNode[]
}

export interface ReturnStatement {
  type: 'ReturnStatement'
  return: JSNode
}

export interface FunctionDecl {
  type: 'FunctionDecl'
  id: Identifier
  params: any[]
  body: ReturnStatement[]
}

export type JSNode = StringLiteral | Identifier | CallExpression | ArrayExpression | ReturnStatement | FunctionDecl

export function createStringLiteral(value: string): StringLiteral {
  return {
    type: 'StringLiteral',
    value,
  }
}

export function createIdentifier(name: string): Identifier {
  return {
    type: 'Identifier',
    name,
  }
}

export function createArrayExpression(elements: JSNode[]): ArrayExpression {
  return {
    type: 'ArrayExpression',
    elements,
  }
}

export function createCallExpression(callee: string, args: JSNode[]): CallExpression {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments: args,
  }
}
