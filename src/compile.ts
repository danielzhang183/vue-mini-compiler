import { generate } from './generate'
import { parse } from './parse'
import { transform } from './transform'

export function compile(template: string) {
  const ast = parse(template)
  console.log({ ast: JSON.stringify(ast, null, 2) })
  transform(ast)
  console.log({ transform: JSON.stringify(ast, null, 2) })
  const code = generate(ast.jsNode!)

  return code
}
