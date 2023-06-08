import type { CommentNode, ElementNode, InterpolationNode, TemplateChildNode, TextNode } from './ast'
import { NodeTypes, createRoot } from './ast'

export enum TextModes {
  DATA = 'DATA',
  RCDATA = 'RCDATA',
  RAWTEXT = 'RAWTEXT',
  CDATA = 'CDATA',
}

enum TagType {
  START,
  END,
}

export const spaceRE = /^[\t\r\n\f ]+/
export const tagRE = /^<\/?([a-z][^\t\r\n\f />]*)/i
export const RAWTEXT_RE = /style|xmp|iframe|noembed|noframes|noscript/

export interface ParserOptions {
  getTextMode?: (
    node: ElementNode,
    parent: ElementNode | undefined
  ) => TextModes
}

export type MergedParserOptions = Required<ParserOptions>

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
    else if (RAWTEXT_RE.test(tag))
      return TextModes.RAWTEXT

    return TextModes.DATA
  },
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
      const match = spaceRE.exec(context.source)
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

  while (!isEnd(context, ancestors)) {
    const { source } = context
    let node: TemplateChildNode | undefined
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (mode === TextModes.DATA && source[0] === '<') {
        if (source[1] === '!') {
          if (source.startsWith('<!--'))
            node = parseComment(context)
          else if (source.startsWith('<![CDATA['))
            node = parseCDATA(context, ancestors)
        }
        else if (source[1] === '/') {
          console.error('Invalid Eng Tag')
          continue
        }
        else if (/[a-z]/i.test(source[1])) {
          node = parseElement(context, ancestors)
        }
      }
      else if (source.startsWith('{{')) {
        node = parseInterpolation(context)
      }
    }

    if (!node)
      node = parseText(context, mode)

    nodes.push(node)
  }

  return nodes
}

function isEnd(
  context: ParserContext,
  ancestors: ElementNode[],
): boolean {
  if (!context.source)
    return true

  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (context.source.startsWith(`</${ancestors[i].tag}`))
      return true
  }

  return false
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
    console.error(`${element.tag} tag has lack of closing tag`)

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
  console.log({ tagMatch: match })
  const tag = match[1]

  advanceBy(match[0].length)
  advanceSpace()
  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(isSelfClosing ? 2 : 1)

  if (type === TagType.END)
    return

  return {
    type: NodeTypes.ElEMENT,
    tag,
    props: [],
    children: [],
    isSelfClosing,
    jsNode: undefined,
  }
}

function parseCDATA(
  context: ParserContext,
  ancestors: ElementNode[],
): TemplateChildNode {

}

function parseComment(context: ParserContext): CommentNode {

}

function parseInterpolation(context: ParserContext): InterpolationNode {

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

function last<T>(xs: T[]): T | undefined {
  return xs[xs.length - 1]
}
