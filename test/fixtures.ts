import type { RootNode } from '../src'

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
