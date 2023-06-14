export interface NodeOptions {
  createElement(tag: string): HTMLElement
  setElementText(el: Element, text: string): void
  insert(el: Element, parent: Element, anchor?: Node | null): void
}

export const nodeOptions = {
  createElement(tag: string) {
    return document.createElement(tag)
  },
  setElementText(el: Element, text: string) {
    el.textContent = text
  },
  insert(el: Element, parent: Element, anchor: Node | null = null) {
    parent.insertBefore(el, anchor)
  },
}
