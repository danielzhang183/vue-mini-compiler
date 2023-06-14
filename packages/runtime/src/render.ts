import type { NodeOptions } from './nodeOptions'
import { isString } from './utils'
import type { VNode } from './vnode'

export type Container = HTMLElement & {
  _vnode: VNode
}

export interface RendererOptions {
  nodeOptions: NodeOptions
}

export function createRenderer(options: RendererOptions) {
  const {
    createElement,
    setElementText,
    insert,
  } = options.nodeOptions
  function render(vnode: VNode, container: Container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    }
    else {
      if (container._vnode)
        container.innerHTML = ''
    }

    container._vnode = vnode
  }

  function patch(
    n1: VNode | undefined,
    n2: VNode,
    container: Container,
  ) {
    if (!n1)
      mountElement(n2, container)
  }

  function mountElement(vnode: VNode, container: Container) {
    const el = createElement(vnode.type)
    if (isString(vnode.children))
      setElementText(el, vnode.children)
    insert(el, container)
  }

  return {
    render,
  }
}
