/**
 * Default sample landing page document for Next.js reference example.
 * Completely JSON-serializable canonical document structure.
 */

import { createDocument, createNode, type IRichDocument } from '@irich/core';

export const initialNextjsDocument: IRichDocument = createDocument({
  metadata: {
    title: 'iRich Next.js Starter Landing Page',
    author: 'iRich Engineering',
    description: 'Reference demonstration of embeddable visual content editing in Next.js.',
  },
  root: {
    id: 'root',
    type: 'root',
    children: [
      // 1. HERO BANNER
      createNode({
        id: 'hero-1',
        type: 'Hero',
        props: {
          badge: '✦ Next.js App Router + iRich',
          title: 'Visual Page Composition for Modern Next.js Apps',
          subtitle:
            'iRich bridges structured rich-text authoring with modular React components. Fast, SSR-compatible, and fully serializable to clean JSON.',
          align: 'center',
          ctaText: 'Open Visual Editor',
          ctaUrl: '/editor',
          secondaryCtaText: 'Explore Architecture',
          secondaryCtaUrl: '#architecture',
        },
      }),

      // 2. PROSE HIGHLIGHT SECTION
      createNode({
        id: 'container-prose',
        type: 'Container',
        props: {
          maxWidth: 'medium',
          padding: 'medium',
          background: 'card',
        },
        children: [
          createNode({
            id: 'heading-intro',
            type: 'Heading',
            props: {
              text: 'Why Engineering Teams Choose iRich',
              level: 'h2',
              align: 'center',
              color: 'gradient',
            },
          }),
          createNode({
            id: 'richtext-intro',
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
                        text: 'Unlike monolithic WYSIWYG editors or proprietary CMS systems that inject messy HTML blobs into your pages, ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'bold' }],
                        text: 'iRich represents every page as a strictly typed JSON Abstract Syntax Tree (AST)',
                      },
                      {
                        type: 'text',
                        text: '. Components are standard React components defined directly in your application codebase.',
                      },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),

      // 3. CORE ARCHITECTURE HIGHLIGHTS
      createNode({
        id: 'container-cards',
        type: 'Container',
        props: {
          maxWidth: 'wide',
          padding: 'medium',
          background: 'transparent',
        },
        children: [
          createNode({
            id: 'heading-arch',
            type: 'Heading',
            props: {
              text: 'Core Architectural Guarantees',
              level: 'h2',
              align: 'center',
              color: 'default',
            },
          }),
          createNode({
            id: 'card-1',
            type: 'Card',
            props: {
              tag: 'SSR & RSC',
              title: 'Server-Side Rendering',
              description:
                '@irich/renderer has zero browser dependencies and renders directly on the server in React Server Components.',
              variant: 'default',
              buttonText: 'View Docs',
              buttonUrl: '#',
            },
          }),
          createNode({
            id: 'card-2',
            type: 'Card',
            props: {
              tag: 'Zero Lock-in',
              title: 'Pure JSON Document Model',
              description:
                'Documents serialize to clean JSON with stable node IDs. No runtime closures, React elements, or DOM nodes in state.',
              variant: 'highlight',
              buttonText: 'Inspect Schema',
              buttonUrl: '#',
            },
          }),
          createNode({
            id: 'card-3',
            type: 'Card',
            props: {
              tag: 'Fine-Grained',
              title: 'Isolated State Transitions',
              description:
                'Mutations execute through transactional commands with linear undo/redo and selective React subscriptions.',
              variant: 'default',
              buttonText: 'Learn Commands',
              buttonUrl: '#',
            },
          }),
        ],
      }),

      // 4. CALL TO ACTION SECTION
      createNode({
        id: 'container-cta',
        type: 'Container',
        props: {
          maxWidth: 'medium',
          padding: 'medium',
          background: 'subtle',
        },
        children: [
          createNode({
            id: 'heading-cta',
            type: 'Heading',
            props: {
              text: 'Ready to Experience Visual Authoring?',
              level: 'h2',
              align: 'center',
              color: 'gradient',
            },
          }),
          createNode({
            id: 'btn-cta',
            type: 'Button',
            props: {
              label: 'Launch Visual Studio →',
              url: '/editor',
              variant: 'primary',
              size: 'lg',
            },
          }),
        ],
      }),
    ],
  },
});
