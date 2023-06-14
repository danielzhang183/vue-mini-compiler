export interface CompilerError extends SyntaxError {
  code: number | string
}

export interface CoreCompilerError extends CompilerError {
  code: ErrorCodes
}

export function defaultOnError(error: CompilerError) {
  throw error
}

export function defaultOnWarn(msg: CompilerError) {
  console.warn(`[Mini Vue warn] ${msg.message}`)
}

type InferCompilerError<T> = T extends ErrorCodes
  ? CoreCompilerError
  : CompilerError

export function createCompilerError<T extends number>(
  code: T,
  messages?: { [code: number]: string },
  additionalMessage?: string,
): InferCompilerError<T> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const msg = (messages || errorMessages)[code] + (additionalMessage || '')
  const error = new SyntaxError(String(msg)) as InferCompilerError<T>
  error.code = code
  return error
}

export const enum ErrorCodes {
  // parse errors
  ABRUPT_CLOSING_OF_EMPTY_COMMENT,
  CDATA_IN_HTML_CONTENT,
  DUPLICATE_ATTRIBUTE,
  END_TAG_WITH_ATTRIBUTES,
  END_TAG_WITH_TRAILING_SOLIDUS,
  EOF_BEFORE_TAG_NAME,
  EOF_IN_CDATA,
  EOF_IN_COMMENT,
  EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT,
  EOF_IN_TAG,
  INCORRECTLY_CLOSED_COMMENT,
  INCORRECTLY_OPENED_COMMENT,
  INVALID_FIRST_CHARACTER_OF_TAG_NAME,
  MISSING_ATTRIBUTE_VALUE,
  MISSING_END_TAG_NAME,
  NESTED_COMMENT,

  // Vue-specific parse errors
  X_INVALID_END_TAG,
  X_MISSING_END_TAG,
  X_MISSING_INTERPOLATION_END,
  X_MISSING_DIRECTIVE_NAME,
  X_MISSING_DYNAMIC_DIRECTIVE_ARGUMENT_END,
}

export const errorMessages: Record<ErrorCodes, string> = {
  // parse errors
  [ErrorCodes.ABRUPT_CLOSING_OF_EMPTY_COMMENT]: 'Illegal comment.',
  [ErrorCodes.CDATA_IN_HTML_CONTENT]: 'CDATA section is allowed only in XML context.',
  [ErrorCodes.DUPLICATE_ATTRIBUTE]: 'Duplicate attribute.',
  [ErrorCodes.END_TAG_WITH_ATTRIBUTES]: 'End tag cannot have attributes.',
  [ErrorCodes.END_TAG_WITH_TRAILING_SOLIDUS]: 'Illegal \'/\' in tags.',
  [ErrorCodes.EOF_BEFORE_TAG_NAME]: 'Unexpected EOF in tag.',
  [ErrorCodes.EOF_IN_CDATA]: 'Unexpected EOF in CDATA section.',
  [ErrorCodes.EOF_IN_COMMENT]: 'Unexpected EOF in comment.',
  [ErrorCodes.EOF_IN_SCRIPT_HTML_COMMENT_LIKE_TEXT]: 'Unexpected EOF in script.',
  [ErrorCodes.EOF_IN_TAG]: 'Unexpected EOF in tag.',
  [ErrorCodes.INCORRECTLY_CLOSED_COMMENT]: 'Incorrectly closed comment.',
  [ErrorCodes.INCORRECTLY_OPENED_COMMENT]: 'Incorrectly opened comment.',
  [ErrorCodes.INVALID_FIRST_CHARACTER_OF_TAG_NAME]: 'Illegal tag name. Use \'&lt;\' to print \'<\'.',
  [ErrorCodes.MISSING_ATTRIBUTE_VALUE]: 'Attribute value was expected.',
  [ErrorCodes.MISSING_END_TAG_NAME]: 'End tag name was expected.',
  [ErrorCodes.NESTED_COMMENT]: 'Unexpected \'<!--\' in comment.',

  // Vue-specific parse errors
  [ErrorCodes.X_INVALID_END_TAG]: 'Invalid end tag.',
  [ErrorCodes.X_MISSING_END_TAG]: 'Element is missing end tag.',
  [ErrorCodes.X_MISSING_INTERPOLATION_END]: 'Interpolation end sign was not found.',
  [ErrorCodes.X_MISSING_DYNAMIC_DIRECTIVE_ARGUMENT_END]:
    'End bracket for dynamic directive argument was not found. '
    + 'Note that dynamic directive argument cannot contain spaces.',
  [ErrorCodes.X_MISSING_DIRECTIVE_NAME]: 'Legal directive name was expected.',
}
