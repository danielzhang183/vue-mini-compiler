import type { ElementNode } from './ast'
import type { CompilerError } from './errors'
import type { TextModes } from './parse'

export interface ErrorHandlingOptions {
  onWarn?: (warning: CompilerError) => void
  onError?: (error: CompilerError) => void
}

export interface ParserOptions extends ErrorHandlingOptions {
  getTextMode?: (
    node: ElementNode,
    parent: ElementNode | undefined
  ) => TextModes
}

export type MergedParserOptions = Required<ParserOptions>
