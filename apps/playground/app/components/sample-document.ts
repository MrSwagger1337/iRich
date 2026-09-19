/**
 * Sample initial IRichDocument for the playground.
 */

import { createDocument, createNode, type IRichDocument } from '@irich/core';

export function createPlaygroundSampleDocument(): IRichDocument {
  return createDocument({
    version: '1.0.0',
    root: createNode({
      id: 'root',
      type: 'root',
      props: {},
      children: [
        // 1. Hero Section
        createNode({
          id: 'hero-banner',
          type: 'Hero',
          props: {
            badge: '✦ Next-Gen Visual Editor for React',
            title: 'Visual Editing Meets React Freedom',
            subtitle:
              'Embed a fast, lightweight, and extensible content editor in any React application with pure JSON-serializable documents and fine-grained reactivity.',
            align: 'center',
            primaryActionLabel: 'Get Started',
            secondaryActionLabel: 'GitHub Repo',
          },
        }),

        // 2. Feature Section Container
        createNode({
          id: 'features-container',
          type: 'Container',
          props: {
            padding: 'large',
            maxWidth: 'wide',
            background: 'transparent',
            layout: 'vertical',
          },
          children: [
            createNode({
              id: 'section-heading',
              type: 'Heading',
              props: {
                text: 'Architectural Capabilities',
                level: 'h2',
                align: 'center',
              },
            }),
            createNode({
              id: 'section-subtitle',
              type: 'Text',
              props: {
                content:
                  'Built from first principles to decouple core document mutations, React bindings, and production rendering.',
                size: 'lead',
                color: 'muted',
                align: 'center',
              },
            }),

            // Grid container for 3 Cards
            createNode({
              id: 'cards-grid',
              type: 'Container',
              props: {
                padding: 'medium',
                maxWidth: 'full',
                background: 'transparent',
                layout: 'grid-3',
              },
              children: [
                createNode({
                  id: 'card-core',
                  type: 'Card',
                  props: {
                    tag: 'Core Engine',
                    title: 'Framework Independent',
                    description:
                      '@irich/core is pure TypeScript with zero browser or React dependencies. Run on server, edge, or Node.',
                    variant: 'elevated',
                  },
                }),
                createNode({
                  id: 'card-renderer',
                  type: 'Card',
                  props: {
                    tag: 'Renderer',
                    title: 'Lightweight SSR',
                    description:
                      '@irich/renderer delivers zero-overhead React component rendering with full server-side streaming support.',
                    variant: 'elevated',
                  },
                }),
                createNode({
                  id: 'card-react',
                  type: 'Card',
                  props: {
                    tag: 'React Bindings',
                    title: 'Fine-Grained Reactivity',
                    description:
                      'Powered by useSyncExternalStore. Subscribes only to targeted nodes and selection slices to eliminate unnecessary re-renders.',
                    variant: 'elevated',
                  },
                }),
              ],
            }),

            // Rich Text Demonstration Block
            createNode({
              id: 'richtext-demo',
              type: 'RichText',
              props: {
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 3 },
                      content: [
                        { type: 'text', text: '✦ Structured Rich-Text Authoring' },
                      ],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'iRich incorporates ' },
                        { type: 'text', text: 'first-class rich text editing', marks: [{ type: 'bold' }] },
                        { type: 'text', text: ' with inline formatting such as ' },
                        { type: 'text', text: 'italic emphasis', marks: [{ type: 'italic' }] },
                        { type: 'text', text: ', ' },
                        { type: 'text', text: 'code marks', marks: [{ type: 'code' }] },
                        { type: 'text', text: ', and ' },
                        {
                          type: 'text',
                          text: 'custom hyperlinks',
                          marks: [{ type: 'link', attrs: { href: 'https://github.com/MrSwagger1337/iRich' } }],
                        },
                        { type: 'text', text: '. Double-click this block to edit inline with the floating toolbar!' },
                      ],
                    },
                    {
                      type: 'bulletList',
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Strictly JSON-serializable ProseMirror AST' }],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Lightweight SSR-safe production renderer' }],
                            },
                          ],
                        },
                        {
                          type: 'listItem',
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'Decoupled controller and extensible marks' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            }),

            // Call to Action Box
            createNode({
              id: 'cta-container',
              type: 'Container',
              props: {
                padding: 'large',
                maxWidth: 'medium',
                background: 'card',
                layout: 'vertical',
              },
              children: [
                createNode({
                  id: 'cta-heading',
                  type: 'Heading',
                  props: {
                    text: 'Ready to Build Your Visual Experience?',
                    level: 'h3',
                    align: 'center',
                  },
                }),
                createNode({
                  id: 'cta-text',
                  type: 'Text',
                  props: {
                    content:
                      'Click on any component on this canvas to inspect and edit its properties in real time on the right inspector panel.',
                    size: 'md',
                    color: 'muted',
                    align: 'center',
                  },
                }),
                createNode({
                  id: 'cta-button',
                  type: 'Button',
                  props: {
                    label: 'Explore Components in Sidebar',
                    variant: 'primary',
                    size: 'lg',
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
