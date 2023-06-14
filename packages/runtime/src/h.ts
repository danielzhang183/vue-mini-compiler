import { isArray, isObject } from './utils'
import type { VNode, VNodeArrayChildren } from './vnode'
import { createVNode, isVNode } from './vnode'

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => any)

// element
export function h(type: string, children?: RawChildren): VNode

export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren))
        return createVNode(type, null, [propsOrChildren])
      // @ts-expect-error okay
      return createVNode(type, propsOrChildren)
    }
    else {
      return createVNode(type, null, propsOrChildren)
    }
  }
  else {
    if (l > 3)
      // eslint-disable-next-line prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)
    else if (l === 3)
      children = [children]

    return createVNode(type, propsOrChildren, children)
  }
}
