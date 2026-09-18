/**
 * Sample document for Vite React example.
 */

import { createDocument, createNode, type IRichDocument } from '@irich/core';

export const initialViteDocument: IRichDocument = createDocument({
  metadata: {
    title: 'iRich Vite React Demo',
    description: 'Demonstrating standalone React + Vite visual editing without Next.js.',
  },
  root: {
    id: 'root',
    type: 'root',
    children: [
      createNode({
        id: 'hero-vite',
        type: 'Hero',
        props: {
          badge: '⚡ Pure React + Vite Bundle',
          title: 'Lightweight Visual Content Editor for Single Page Apps',
          subtitle:
            'iRich delivers modular visual editing and production rendering with zero dependency on meta-frameworks like Next.js.',
          primaryActionText: 'Open Editor Mode',
          primaryActionUrl: '#editor',
        },
      }),

      createNode({
        id: 'alert-verify',
        type: 'Alert',
        props: {
          message: 'Zero Next.js dependency invariant verified: Built directly with Vite + Rollup.',
          type: 'success',
        },
      }),

      createNode({
        id: 'container-cards',
        type: 'Container',
        props: {
          maxWidth: 'wide',
          padding: 'medium',
          background: 'subtle',
        },
        children: [
          createNode({
            id: 'heading-cards',
            type: 'Heading',
            props: {
              text: 'Core Standalone Capabilities',
              level: 'h2',
              align: 'center',
            },
          }),
          createNode({
            id: 'card-vite-1',
            type: 'Card',
            props: {
              title: 'Framework Independent Core',
              description: '@irich/core runs in pure JavaScript environments without DOM or framework coupling.',
              tag: 'Core Principle #1',
            },
          }),
          createNode({
            id: 'card-vite-2',
            type: 'Card',
            props: {
              title: 'Fine-Grained Reactivity',
              description: 'Hooks use useSyncExternalStore to subscribe to targeted state slices without full tree tearing.',
              tag: 'React 19 Ready',
            },
          }),
          createNode({
            id: 'richtext-vite',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'This document was compiled and bundled by ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'bold' }],
                        text: 'Vite 6',
                      },
                      {
                        type: 'text',
                        text: ' and rendered via ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'code' }],
                        text: '@irich/renderer',
                      },
                      {
                        type: 'text',
                        text: '.',
                      },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),
    ],
  },
});
