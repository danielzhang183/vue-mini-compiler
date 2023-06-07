export enum NodeTypes {
  ROOT,
  ElEMENT,
  TEXT,
  IDENTIFIER,
  SIMPLE_EXPRESSION,
  COMPOUND_EXPRESSION,
  // codegen
  JS_CALL_EXPRESSION,
  JS_PROPERTY,
  JS_ARRAY_EXPRESSION,
  JS_FUNCTION_EXPRESSION,
  JS_RETURN_STATEMENT,
}

export interface Node {
  type: NodeTypes
}

export type ParentNode = RootNode | ElementNode

export type TemplateChildNode =
  | ElementNode
  | TextNode

export interface RootNode extends Node {
  type: NodeTypes.ROOT
  children: TemplateChildNode[]
  jsNode: JSChildNode | undefined
}

export interface ElementNode extends Node {
  type: NodeTypes.ElEMENT
  tag: string
  children: TemplateChildNode[]
  jsNode: JSChildNode | undefined
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT
  content: string
  jsNode: JSChildNode | undefined
}

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

export interface SimpleExpressionNode extends Node {
  type: NodeTypes.SIMPLE_EXPRESSION
  content: string
}

export interface CompoundExpressionNode extends Node {
  type: NodeTypes.COMPOUND_EXPRESSION
  children: (
    | string
    | symbol
    | TextNode
    | SimpleExpressionNode
    | CompoundExpressionNode
  )[]
}

export type JSChildNode =
  | Property
  | Identifier
  | CallExpression
  | ArrayExpression
  | ExpressionNode
  | FunctionExpression
  | ReturnStatement

export interface Property extends Node {
  type: NodeTypes.JS_PROPERTY
  value: string
}

export interface Identifier extends Node {
  type: NodeTypes.IDENTIFIER
  name: string
}

export interface CallExpression extends Node {
  type: NodeTypes.JS_CALL_EXPRESSION
  callee: string | symbol
  arguments: (
    | string
    | symbol
    | JSChildNode
    | TemplateChildNode
    | TemplateChildNode[]
  )[]
}

export interface ArrayExpression extends Node {
  type: NodeTypes.JS_ARRAY_EXPRESSION
  elements: JSChildNode[]
}

export interface ReturnStatement extends Node {
  type: NodeTypes.JS_RETURN_STATEMENT
  returns: TemplateChildNode | TemplateChildNode[] | JSChildNode
}

export interface FunctionExpression extends Node {
  type: NodeTypes.JS_FUNCTION_EXPRESSION
  id: Identifier
  params: ExpressionNode | string | (ExpressionNode | string)[] | undefined
  returns?: TemplateChildNode | TemplateChildNode[] | JSChildNode
  body?: JSChildNode[]
}

export function createObjectProperty(value: string): Property {
  return {
    type: NodeTypes.JS_PROPERTY,
    value,
  }
}

export function createIdentifier(name: string): Identifier {
  return {
    type: NodeTypes.IDENTIFIER,
    name,
  }
}

export function createArrayExpression(elements: JSChildNode[]): ArrayExpression {
  return {
    type: NodeTypes.JS_ARRAY_EXPRESSION,
    elements,
  }
}

export function createFunctionExpression(
  params: FunctionExpression['params'],
  returns: FunctionExpression['returns'] = undefined,
  name: string,
): FunctionExpression {
  return {
    type: NodeTypes.JS_FUNCTION_EXPRESSION,
    id: createIdentifier(name),
    params,
    returns,
  }
}

export function createCallExpression<T extends CallExpression['callee']>(
  callee: T,
  args: CallExpression['arguments'],
): CallExpression {
  return {
    type: NodeTypes.JS_CALL_EXPRESSION,
    callee,
    arguments: args,
  }
}

export function createReturnStatement(
  returns: ReturnStatement['returns'],
): ReturnStatement {
  return {
    type: NodeTypes.JS_RETURN_STATEMENT,
    returns,
  }
}

export function createRoot(): RootNode {
  return {
    type: NodeTypes.ROOT,
    children: [],
    jsNode: undefined,
  }
}
