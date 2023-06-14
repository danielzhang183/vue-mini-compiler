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
  /**
   * Whitespace handling strategy
   */
  whitespace?: 'preserve' | 'condense'
  /**
   * Whether to keep comments in the templates AST.
   * This defaults to `true` in development and `false` in production builds.
   */
  comments?: boolean
}

export type MergedParserOptions = Required<ParserOptions>
