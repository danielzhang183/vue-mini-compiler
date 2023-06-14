export const Text = Symbol.for('v-txt')
export const Comment = Symbol.for('v-cmt')
export const Static = Symbol.for('v-stc')

export type VNodeTypes =
  | string
  | VNode
  | typeof Text
  | typeof Static
  | typeof Comment

export interface Data { [x: string]: unknown }

export interface VNodeProps {
  __v_isVNode: boolean
  key?: string | number | symbol
}

type VNodeChildAtom =
  | string
  | boolean
  | number
  | null
  | undefined
  | void
  | VNode

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>
export type VNodeChild = VNodeChildAtom | VNodeArrayChildren
export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  | null

export interface VNode<
  ExtraProps = { [key: string]: any },
> {
  /**
   * @internal
   */
  __v_isVNode: true

  type: VNodeTypes
  props: (VNodeProps & ExtraProps) | null
  key: string | number | symbol | null
  children: VNodeNormalizedChildren

  // optimization only
  shapeFlag: number
  patchFlag: number
  /**
   * @internal
   */
  dynamicProps: string[] | null
  /**
   * @internal
   */
  dynamicChildren: VNode[] | null
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

export function createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  // isBlockVNode = false,
): VNode {
  const vnode = <VNode>{
    __v_isVNode: true,
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
  }

  return vnode
}
