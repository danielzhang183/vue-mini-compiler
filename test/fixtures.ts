import type { RootNode } from '../src'

export const template = '<div><p>Vue</p><p>Template</p></div>'

export const root: RootNode = {
  children: [
    {
      children: [
        {
          children: [
            {
              content: 'Vue',
              jsNode: undefined,
              type: 'Text',
            },
          ],
          jsNode: undefined,
          tag: 'p',
          type: 'Element',
        },
        {
          children: [
            {
              content: 'Template',
              jsNode: undefined,
              type: 'Text',
            },
          ],
          jsNode: undefined,
          tag: 'p',
          type: 'Element',
        },
      ],
      jsNode: undefined,
      tag: 'div',
      type: 'Element',
    },
  ],
  jsNode: undefined,
  type: 'Root',
}
