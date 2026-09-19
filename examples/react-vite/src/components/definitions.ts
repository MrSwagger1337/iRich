/**
 * Component definitions and registry for React + Vite example.
 * Composes canonical @irich/editorial vocabulary with custom application components.
 */

import { defineComponent } from '@irich/core';
import {
  createEditorialRegistry,
  editorialDefinitions,
} from '@irich/editorial';

/**
 * Custom Application-specific component extending standard editorial vocabulary.
 */
export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  description: 'High-impact landing hero with eyebrow badge, title, and CTA button.',
  icon: 'sparkles',
  canHaveChildren: false,
  fields: {
    badge: {
      type: 'text',
      label: 'Eyebrow Badge',
      defaultValue: '✦ iRich for React + Vite',
    },
    title: {
      type: 'text',
      label: 'Headline Title',
      defaultValue: 'Visual Content Composition for React & Vite',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle Description',
      defaultValue:
        'Bridge structured rich-text authoring with modular editorial React components. Fast, client-side or SSR-compatible, and fully serializable to clean JSON.',
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
  },
});

/**
 * Creates the Vite consumer ComponentRegistry by extending the canonical editorial registry.
 */
export function createViteRegistry() {
  const registry = createEditorialRegistry();
  registry.register(HeroComponent);
  return registry;
}

export const viteComponentDefinitions = [
  ...editorialDefinitions,
  HeroComponent,
];

export const canonicalViteComponents = viteComponentDefinitions;
