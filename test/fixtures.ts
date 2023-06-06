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
              type: 'Text',
            },
          ],
          tag: 'p',
          type: 'Element',
        },
        {
          children: [
            {
              content: 'Template',
              type: 'Text',
            },
          ],
          tag: 'p',
          type: 'Element',
        },
      ],
      tag: 'div',
      type: 'Element',
    },
  ],
  type: 'Root',
}
