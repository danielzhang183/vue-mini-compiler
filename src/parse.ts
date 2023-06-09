import type { AttributeNode, CommentNode, DirectiveNode, ElementNode, InterpolationNode, TemplateChildNode, TextNode } from './ast'
import { NodeTypes, createRoot } from './ast'
import { ErrorCodes, createCompilerError, defaultOnError, defaultOnWarn } from './errors'
import type { MergedParserOptions, ParserOptions } from './options'

export enum TextModes {
  DATA = 'DATA',
  RCDATA = 'RCDATA',
  RAWTEXT = 'RAWTEXT',
  CDATA = 'CDATA',
  ATTRIBUTE_VALUE = 'ATTRIBUTE_VALUE',
}

enum TagType {
  START,
  END,
}

export interface ParserContext {
  options: MergedParserOptions
  source: string
  advanceBy(num: number): void
  advanceSpace(): void
}

export const defaultParserOptions = {
  getTextMode: ({ tag }: ElementNode) => {
    if (tag === 'textarea' || tag === 'title')
      return TextModes.RCDATA
    else if (/style|xmp|iframe|noembed|noframes|noscript/.test(tag))
      return TextModes.RAWTEXT

    return TextModes.DATA
  },
  onWarn: defaultOnWarn,
  onError: defaultOnError,
}

export function createParserContext(
  content: string,
  rawOptions: ParserOptions,
): ParserContext {
  const options = {
    ...defaultParserOptions,
    ...rawOptions,
  }

  const context = <ParserContext>{
    options,
    source: content,
    advanceBy(numberOfCharacters: number) {
      context.source = context.source.slice(numberOfCharacters)
      console.log({ source: context.source })
    },
    advanceSpace() {
      const match = /^[\t\r\n\f ]+/.exec(context.source)
      if (match)
        context.advanceBy(match[0].length)
    },
  }

  return context
}

export function parse(
  content: string,
  options: ParserOptions = {},
) {
  const context = createParserContext(content, options)
  const nodes = parseChildren(context, TextModes.DATA, [])
  return createRoot(nodes)
}

export function parseChildren(
  context: ParserContext,
  mode: TextModes,
  ancestors: ElementNode[],
) {
  console.log('----- parseChildren ----')
  const nodes: TemplateChildNode[] = []

  while (!isEnd(context, mode, ancestors)) {
    const { source: s } = context
    let node: TemplateChildNode | TemplateChildNode[] | undefined
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && s[0] === '<') {
        if (s[1] === '!') {
          if (s.startsWith('<!--'))
            node = parseComment(context)
          else if (s.startsWith('<![CDATA['))
            node = parseCDATA(context, ancestors)
        }
        else if (s[1] === '/') {
          if (s.length === 2) {
            emitError(context, ErrorCodes.EOF_BEFORE_TAG_NAME)
          }
          else if (s[2] === '>') {
            emitError(context, ErrorCodes.MISSING_END_TAG_NAME)
            continue
          }
          else if (/[a-z]/i.test(s[2])) {
            emitError(context, ErrorCodes.X_INVALID_END_TAG)
            parseTag(context, TagType.END)
            continue
          }
          else {
            emitError(context, ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME)
            continue
          }
        }
        else if (/[a-z]/i.test(s[1])) {
          node = parseElement(context, ancestors)
        }
      }
      else if (s.startsWith('{{')) {
        node = parseInterpolation(context, mode)
      }
    }

    if (!node)
      node = parseText(context, mode)

    if (Array.isArray(node))
      nodes.push(...node)
    else
      nodes.push(node)
  }

  return nodes
}

function emitError(
  context: ParserContext,
  code: ErrorCodes,
): void {
  context.options.onError(createCompilerError(code))
}

function isEnd(
  context: ParserContext,
  mode: TextModes,
  ancestors: ElementNode[],
): boolean {
  const s = context.source

  switch (mode) {
    case TextModes.DATA:
      for (let i = ancestors.length - 1; i >= 0; i--) {
        if (s.startsWith(`</${ancestors[i].tag}`))
          return true
      }
      break
    case TextModes.RCDATA:
    case TextModes.RAWTEXT: {
      const parent = last(ancestors)
      if (parent && s.startsWith(`</${parent.tag}`))
        return true
      break
    }
    case TextModes.CDATA:
      if (s.startsWith(']]>'))
        return true
      break
  }

  return !s
}

function parseElement(
  context: ParserContext,
  ancestors: ElementNode[],
) {
  console.log('---- parseElement ----')
  const parent = last(ancestors)
  const element = parseTag(context, TagType.START)
  if (element.isSelfClosing)
    return element

  ancestors.push(element)
  const mode = context.options.getTextMode(element, parent)
  element.children = parseChildren(context, mode, ancestors)
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`))
    parseTag(context, TagType.END)
  else
    emitError(context, ErrorCodes.X_MISSING_END_TAG)

  return element
}

function parseTag(
  context: ParserContext,
  type: TagType.START
): ElementNode
function parseTag(
  context: ParserContext,
  type: TagType.END
): void
function parseTag(
  context: ParserContext,
  type: TagType,
): ElementNode | undefined {
  const { advanceBy, advanceSpace } = context
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)!
  const tag = match[1]

  advanceBy(match[0].length)
  advanceSpace()
  const props = parseAttributes(context)

  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(isSelfClosing ? 2 : 1)

  if (type === TagType.END)
    return

  return {
    type: NodeTypes.ElEMENT,
    tag,
    props,
    children: [],
    isSelfClosing,
    jsNode: undefined,
  }
}

function parseText(context: ParserContext, mode: TextModes): TextNode {
  console.log('---- parseText ----')
  const endTokens = mode === TextModes.CDATA
    ? [']]>']
    : ['<', '{{']

  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index)
      endIndex = index
  }

  return {
    type: NodeTypes.TEXT,
    content: parseTextData(context, endIndex, mode),
    jsNode: undefined,
  }
}

function parseTextData(
  context: ParserContext,
  length: number,
  mode: TextModes,
): string {
  const { advanceBy } = context
  const rawText = context.source.slice(0, length)
  advanceBy(length)
  if (
    mode === TextModes.RAWTEXT
    || mode === TextModes.CDATA
    || !rawText.includes('&')
  ) {
    return rawText
  }
  else {
    // TODO
    return ''
  }
}

function parseCDATA(
  context: ParserContext,
  ancestors: ElementNode[],
): TemplateChildNode[] {
  const { advanceBy } = context
  const [open, end] = ['<![CDATA[', ']]>']
  advanceBy(open.length)
  const nodes = parseChildren(context, TextModes.CDATA, ancestors)
  if (context.source.length === 0)
    emitError(context, ErrorCodes.EOF_IN_CDATA)
  else
    advanceBy(end.length)

  return nodes
}

function parseComment(context: ParserContext): CommentNode {
  const { advanceBy } = context

  let content: string
  const match = /--(\!)?>/.exec(context.source)
  if (!match) {
    content = context.source.slice(4)
    advanceBy(context.source.length)
    emitError(context, ErrorCodes.EOF_IN_COMMENT)
  }
  else {
    if (match.index <= 3)
      emitError(context, ErrorCodes.ABRUPT_CLOSING_OF_EMPTY_COMMENT)

    if (match[1])
      emitError(context, ErrorCodes.INCORRECTLY_CLOSED_COMMENT)

    content = context.source.slice(4, match.index)

    // Advancing with reporting nested comments.
    const s = context.source.slice(0, match.index)
    let prevIndex = 1
    let nestedIndex = 0
    while ((nestedIndex = s.indexOf('<!--', prevIndex)) !== -1) {
      advanceBy(nestedIndex - prevIndex + 1)
      if (nestedIndex + 4 < s.length)
        emitError(context, ErrorCodes.NESTED_COMMENT)

      prevIndex = nestedIndex + 1
    }
    advanceBy(match.index + match[0].length - prevIndex + 1)
  }

  return {
    type: NodeTypes.COMMENT,
    content,
  }
}

function parseInterpolation(
  context: ParserContext,
  mode: TextModes,
): InterpolationNode | undefined {
  const { advanceBy } = context
  const [open, close] = ['{{', '}}']
  const closeIndex = context.source.indexOf(close, open.length)
  if (closeIndex === -1) {
    emitError(context, ErrorCodes.X_MISSING_INTERPOLATION_END)
    return
  }

  // consume `{{`
  advanceBy(open.length)
  const length = closeIndex - open.length
  const preTrimContent = parseTextData(context, length, mode)
  const content = preTrimContent.trim()
  // consume `}}`
  advanceBy(close.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  }
}

type AttributeValue =
  | {
    content: string
    isQuoted: boolean
  }
  | undefined

function parseAttributes(context: ParserContext): Array<AttributeNode | DirectiveNode> {
  const props: AttributeNode[] = []

  while (
    !context.source.startsWith('>')
    && !context.source.startsWith('/>')
  ) {
    const attr = parseAttribute(context)
    props.push(attr)
  }

  return props
}

function parseAttribute(context: ParserContext): AttributeNode {
  const { advanceBy, advanceSpace } = context

  // <div id='foo'>
  // <div id="foo">
  // <div id=foo>
  // <div id= foo >
  // Name
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!
  const name = match[0]
  advanceBy(name.length)

  // Value
  let value: AttributeValue | undefined
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpace()
    // consume '='
    advanceBy(1)
    advanceSpace()
    value = parseAttributeValue(context)
  }

  advanceSpace()
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && ({
      type: NodeTypes.TEXT,
      content: value.content,
      jsNode: undefined,
    }) as TextNode,
  }
}

function parseAttributeValue(context: ParserContext): AttributeValue {
  let content: string | undefined
  const { advanceBy } = context

  const quote = context.source[0]
  const isQuoted = ['"', '\''].includes(quote)
  if (isQuoted) {
    // Quote Value
    // consume quote
    advanceBy(1)
    const endIndex = context.source.indexOf(quote)
    if (endIndex > -1) {
      content = parseTextData(context, endIndex, TextModes.ATTRIBUTE_VALUE)
      // consume quote another pair
      advanceBy(1)
    }
    else {
      content = parseTextData(context, endIndex, TextModes.ATTRIBUTE_VALUE)
    }
  }
  else {
    // Unquoted Value
    const match = /^[^\t\r\n\f >]+/.exec(context.source)
    if (!match)
      return undefined
    content = parseTextData(context, match[0].length, TextModes.ATTRIBUTE_VALUE)
  }

  return {
    content,
    isQuoted,
  }
}

function last<T>(xs: T[]): T | undefined {
  return xs[xs.length - 1]
}
