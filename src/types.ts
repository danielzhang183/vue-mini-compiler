export enum State {
  initial = 1,
  tagOpen,
  tagName,
  text,
  tagEnd,
  tagEndName,
}

export interface Token {
  type: keyof typeof State
  content?: string
  name?: string
}
