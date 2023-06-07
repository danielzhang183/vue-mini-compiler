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
              type: 2,
            },
          ],
          jsNode: undefined,
          tag: 'p',
          type: 1,
        },
        {
          children: [
            {
              content: 'Template',
              jsNode: undefined,
              type: 2,
            },
          ],
          jsNode: undefined,
          tag: 'p',
          type: 1,
        },
      ],
      jsNode: undefined,
      tag: 'div',
      type: 1,
    },
  ],
  jsNode: undefined,
  type: 0,
}
