/**
 * Default sample landing page document for Next.js example.
 * Completely JSON-serializable canonical document structure.
 */

import { createDocument, createNode, type IRichDocument } from '@irich/core';

export const initialNextjsDocument: IRichDocument = createDocument({
  metadata: {
    title: 'iRich Next.js Starter Landing Page',
    author: 'iRich Engineering',
    description: 'Production-ready showcase of embeddable visual content editing in Next.js.',
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
          badge: '✦ Next.js 15 + iRich Visual Builder',
          title: 'The Visual Content Editor for Next.js Developers',
          subtitle:
            'iRich bridges modular React component composition with structured rich-text authoring. Completely decoupled from proprietary hosting with pure JSON state.',
          align: 'center',
          primaryCtaText: 'Open Visual Editor',
          primaryCtaUrl: '/editor',
          secondaryCtaText: 'Explore Features',
          secondaryCtaUrl: '#features',
        },
      }),

      // 2. HIGHLIGHT RICH-TEXT CONTAINER
      createNode({
        id: 'container-intro',
        type: 'Container',
        props: {
          maxWidth: 'wide',
          padding: 'medium',
          background: 'card',
          layout: 'stack',
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
                        text: 'Unlike traditional page builders that inject bloated HTML blobs or lock your team into proprietary cloud platforms, ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'bold' }],
                        text: 'iRich treats your document as a strictly typed JSON Abstract Syntax Tree (AST)',
                      },
                      {
                        type: 'text',
                        text: '. Every component is a standard React component registered in your codebase.',
                      },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),

      // 3. FEATURES SECTION WITH FEATURE CARDS
      createNode({
        id: 'features-section',
        type: 'Features',
        props: {
          sectionTitle: 'Architected for Performance & Extensibility',
          sectionSubtitle:
            'Everything you need to deliver high-performance visual editing experiences to non-technical editors.',
          columns: '3',
          align: 'center',
        },
        children: [
          createNode({
            id: 'feature-card-1',
            type: 'FeatureCard',
            props: {
              icon: 'database',
              title: 'Pure JSON Serializable State',
              description:
                'Documents serialize to clean JSON with stable node IDs. No runtime closures, React elements, or DOM nodes stored in state.',
              tag: 'Core Principle',
              color: 'indigo',
            },
          }),
          createNode({
            id: 'feature-card-2',
            type: 'FeatureCard',
            props: {
              icon: 'zap',
              title: 'SSR & RSC Compatible',
              description:
                '@irich/renderer is a lightweight standalone React package that renders without loading editor UI or drag-and-drop controllers.',
              tag: 'Next.js First',
              color: 'emerald',
            },
          }),
          createNode({
            id: 'feature-card-3',
            type: 'FeatureCard',
            props: {
              icon: 'sparkles',
              title: 'AI Action Protocol & Sandbox',
              description:
                'AI assistants suggest structured, sandboxed editor actions with prototype pollution guards and dry-run validation.',
              tag: 'AI Ready',
              color: 'purple',
            },
          }),
        ],
      }),

      // 4. CALL TO ACTION BANNER
      createNode({
        id: 'cta-banner',
        type: 'CTA',
        props: {
          headline: 'Ready to Experience Visual Editing?',
          description:
            'Launch the live editor to inspect real-time property controls, responsive breakpoint toggles, and drag-and-drop page composition.',
          buttonText: 'Launch Visual Editor Now',
          buttonUrl: '/editor',
          variant: 'gradient',
        },
      }),
    ],
  },
});
