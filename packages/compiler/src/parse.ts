import createDebug from 'debug'
import type { AttributeNode, CommentNode, DirectiveNode, ElementNode, ExpressionNode, InterpolationNode, TemplateChildNode, TextNode } from './ast'
import { ConstantTypes, NodeTypes, createRoot } from './ast'
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
  advanceSpaces(): void
}

const debug = {
  context: createDebug('parser:context'),
  total: createDebug('parser:total'),
  children: createDebug('parser:children'),
  tag: createDebug('parser:tag'),
  element: createDebug('parser:element'),
  text: createDebug('parser:text'),
  comment: createDebug('parser:comment'),
  interpolation: createDebug('parser:interpolation'),
  attribute: createDebug('parser:attribute'),
  CDATA: createDebug('parser:CDATA'),
}

export const defaultParserOptions: ParserOptions = {
  getTextMode: ({ tag }: ElementNode) => {
    if (tag === 'textarea' || tag === 'title')
      return TextModes.RCDATA
    else if (/style|xmp|iframe|noembed|noframes|noscript/.test(tag))
      return TextModes.RAWTEXT

    return TextModes.DATA
  },
  onWarn: defaultOnWarn,
  onError: defaultOnError,
  whitespace: 'preserve',
  comments: true,
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
      debug.context(`source ${context.source}`)
    },
    advanceSpaces() {
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
  debug.total(`--------------\n start: ${content}`)
  const context = createParserContext(content, options)
  const nodes = parseChildren(context, TextModes.DATA, [])
  return createRoot(nodes)
}

export function parseChildren(
  context: ParserContext,
  mode: TextModes,
  ancestors: ElementNode[],
) {
  debug.children(`start: ${context.source}, mode: ${mode}`)
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

  let removedWhitespace = false
  if (mode !== TextModes.RAWTEXT && mode !== TextModes.RCDATA) {
    const shouldCondense = context.options.whitespace !== 'preserve'
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.type === NodeTypes.TEXT) {
        if (!/[^\t\r\n\f ]/.test(node.content)) {
          const prev = nodes[i - 1]
          const next = nodes[i + 1]
          // Remove if:
          // - the whitespace is the first or last node, or:
          // - (condense mode) the whitespace is between twos comments, or:
          // - (condense mode) the whitespace is between comment and element, or:
          // - (condense mode) the whitespace is between two elements AND contains newline
          if (
            !prev
            || !next
            || (shouldCondense
              && ((prev.type === NodeTypes.COMMENT
                && next.type === NodeTypes.COMMENT)
                || (prev.type === NodeTypes.COMMENT
                  && next.type === NodeTypes.ELEMENT)
                || (prev.type === NodeTypes.ELEMENT
                  && next.type === NodeTypes.COMMENT)
                || (prev.type === NodeTypes.ELEMENT
                  && next.type === NodeTypes.ELEMENT
                  && /[\r\n]/.test(node.content))))
          ) {
            removedWhitespace = true
            nodes[i] = null as any
          }
          else {
            // Otherwise, the whitespace is condensed into a single space
            node.content = ' '
          }
        }
        else if (shouldCondense) {
          // in condense mode, consecutive whitespaces in text are condensed
          // down to a single space.
          node.content = node.content.replace(/[\t\r\n\f ]+/g, ' ')
        }
      }
      else if (node.type === NodeTypes.COMMENT && !context.options.comments) {
        removedWhitespace = true
        nodes[i] = null as any
      }
    }
  }

  return removedWhitespace ? nodes.filter(Boolean) : nodes
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
  debug.element(`start: ${context.source}`)
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
  debug.tag(`start: ${context.source}, type: ${type}`)
  const { advanceBy, advanceSpaces } = context
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)!
  const tag = match[1]

  advanceBy(match[0].length)
  advanceSpaces()
  const props = parseAttributes(context)

  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(isSelfClosing ? 2 : 1)

  if (type === TagType.END)
    return

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children: [],
    isSelfClosing,
    jsNode: undefined,
  }
}

function parseText(context: ParserContext, mode: TextModes): TextNode {
  debug.text(`start: ${context.source}, mode: ${mode}`)
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
  debug.CDATA(`start: ${context.source}`)
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
  debug.comment(`start: ${context.source}`)
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
  debug.interpolation(`start: ${context.source}, mode: ${mode}`)
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
      isStatic: false,
      constType: ConstantTypes.NOT_CONSTANT,
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
  const { advanceSpaces } = context
  const props: Array<AttributeNode | DirectiveNode> = []

  while (
    context.source.length > 0
    && !context.source.startsWith('>')
    && !context.source.startsWith('/>')
  ) {
    console.log({ source: context.source })
    const attr = parseAttribute(context)
    props.push(attr)
    advanceSpaces()
  }

  return props
}

function parseAttribute(context: ParserContext): AttributeNode | DirectiveNode {
  debug.attribute(`start: ${context.source}`)
  const { advanceBy, advanceSpaces } = context

  // <div id='foo'>
  // <div id="foo">
  // <div id=foo>
  // <div id= foo >
  // Name
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!
  console.log({ match })
  const name = match[0]
  console.log({ name })
  advanceBy(name.length)

  // Value
  let value: AttributeValue | undefined
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpaces()
    // consume '='
    advanceBy(1)
    advanceSpaces()
    value = parseAttributeValue(context)
    console.log({ value })
    if (!value)
      emitError(context, ErrorCodes.MISSING_ATTRIBUTE_VALUE)
  }

  if (/^(v-[A-Za-z0-9-]|:|\.|@|#).test(name)/) {
    const match = /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
      name,
    )!
    const isPropShorthand = name.startsWith('.')
    const directiveName = match[1] || (isPropShorthand || name.startsWith(':'))
      ? 'bind'
      : name.startsWith('@')
        ? 'on'
        : 'slot'

    let arg: ExpressionNode | undefined
    if (match[2]) {
      const isSlot = directiveName === 'slot'
      let content = match[2]
      let isStatic = true
      if (content.startsWith('[')) {
        isStatic = false

        if (!content.endsWith(']')) {
          emitError(
            context,
            ErrorCodes.X_MISSING_DYNAMIC_DIRECTIVE_ARGUMENT_END,
          )
          content = content.slice(1)
        }
        else {
          content = content.slice(1, content.length - 1)
        }
      }
      else if (isSlot) {
        content += match[3] || ''
      }

      arg = {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content,
        isStatic,
        constType: isStatic
          ? ConstantTypes.CAN_STRINGIFY
          : ConstantTypes.NOT_CONSTANT,
      }
      const modifiers = match[3] ? match[3].slice(1).split('.') : []
      if (isPropShorthand)
        modifiers.push('prop')

      return {
        type: NodeTypes.DIRECTIVE,
        name: directiveName,
        exp: value && {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: value.content,
          isStatic: false,
          // Treat as non-constant by default. This can be potentially set to
          // other values by `transformExpression` to make it eligible for hoisting.
          constType: ConstantTypes.NOT_CONSTANT,
        },
        arg,
        modifiers,
      }
    }
  }

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
