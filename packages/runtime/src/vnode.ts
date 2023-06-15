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

const blockStack: (VNode[] | null)[] = []
let currentBlock: VNode[] | null = null

export function openBlock() {
  blockStack.push((currentBlock = []))
}

export function closeBlock() {
  blockStack.pop()
  currentBlock = blockStack[blockStack.length - 1] || null
}

export function createBlock(
  type: VNodeTypes,
  props?: Record<string, any> | null,
  children?: any,
  patchFlag?: number,
  dynamicProps?: string[],
) {
  return setupBlock(
    createVNode(
      type,
      // @ts-expect-error okay
      props,
      children,
      patchFlag,
      dynamicProps,
      true /* isBlock: prevent a block from tracking itself */,
    ),
  )
}

function setupBlock(vnode: VNode) {
  vnode.dynamicChildren = currentBlock || null
  closeBlock()
  if (currentBlock)
    currentBlock.push(vnode)

  return vnode
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
  isBlockVNode = false,
): VNode {
  const vnode = <VNode>{
    __v_isVNode: true,
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
  }

  // track vnode for block tree
  if (
    // avoid a block node from tracking itself
    !isBlockVNode
    && currentBlock
    && vnode.patchFlag
  )
    currentBlock.push(vnode)

  return vnode
}
