/**
 * @irich/core component definitions for Next.js reference example.
 * Composes canonical @irich/editorial vocabulary with Next.js specific components.
 */

import { defineComponent, type ComponentRegistry } from '@irich/core';
import {
  createEditorialRegistry,
  editorialDefinitions,
} from '@irich/editorial';

/**
 * 1. Hero Component (Marketing)
 */
export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  description: 'High-impact landing hero with eyebrow badge, title, subtitle, and CTA buttons.',
  icon: 'sparkles',
  canHaveChildren: false,
  fields: {
    badge: {
      type: 'text',
      label: 'Eyebrow Badge',
      defaultValue: '✦ iRich for Next.js',
    },
    title: {
      type: 'text',
      label: 'Headline Title',
      defaultValue: 'Visual Page Composition for Modern Next.js Apps',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle Description',
      defaultValue:
        'Bridge structured rich-text authoring with modular React components. Fast, SSR-compatible, and fully serializable to clean JSON.',
    },
    align: {
      type: 'select',
      label: 'Alignment',
      defaultValue: 'center',
      responsive: true,
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
      ],
    },
    ctaText: {
      type: 'text',
      label: 'Primary CTA Label',
      defaultValue: 'Open Visual Editor',
    },
    ctaUrl: {
      type: 'text',
      label: 'Primary CTA URL',
      defaultValue: '/editor',
    },
    secondaryCtaText: {
      type: 'text',
      label: 'Secondary CTA Label',
      defaultValue: 'Explore Components',
    },
    secondaryCtaUrl: {
      type: 'text',
      label: 'Secondary CTA URL',
      defaultValue: '#components',
    },
  },
});

/**
 * Creates and registers canonical editorial components + Hero for Next.js example.
 */
export function createNextjsRegistry(): ComponentRegistry {
  const registry = createEditorialRegistry();
  registry.register(HeroComponent);
  return registry;
}

export const canonicalComponentDefinitions = [
  ...editorialDefinitions,
  HeroComponent,
];
