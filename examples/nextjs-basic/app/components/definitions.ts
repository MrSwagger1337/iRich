/**
 * @irich/core component definitions for Next.js reference example.
 * Strictly framework-independent declarations of component schemas, slots, and fields.
 */

import {
  createComponentRegistry,
  defineComponent,
  type ComponentRegistry,
} from '@irich/core';

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
 * 2. Heading Component (Typography)
 */
export const HeadingComponent = defineComponent({
  type: 'Heading',
  label: 'Heading',
  category: 'Typography',
  description: 'Structured headline with hierarchy levels, alignment, and color styles.',
  icon: 'heading',
  canHaveChildren: false,
  fields: {
    text: {
      type: 'text',
      label: 'Heading Text',
      defaultValue: 'Structured Content Architecture',
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      defaultValue: 'h2',
      options: [
        { label: 'H1 - Page Headline', value: 'h1' },
        { label: 'H2 - Section Title', value: 'h2' },
        { label: 'H3 - Subsection Title', value: 'h3' },
        { label: 'H4 - Small Heading', value: 'h4' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      defaultValue: 'left',
      responsive: true,
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default (White)', value: 'default' },
        { label: 'Muted (Gray)', value: 'muted' },
        { label: 'Gradient Accent', value: 'gradient' },
      ],
    },
  },
});

/**
 * 3. RichText Component (Typography)
 */
export const RichTextComponent = defineComponent({
  type: 'RichText',
  label: 'Rich Text',
  category: 'Typography',
  description: 'Formatted prose text supporting inline bold, italic, links, and paragraphs.',
  icon: 'file-text',
  canHaveChildren: false,
  fields: {
    placeholder: {
      type: 'text',
      label: 'Placeholder Text',
      defaultValue: 'Click to edit formatted prose...',
    },
  },
});

/**
 * 4. Container Component (Layout)
 */
export const ContainerComponent = defineComponent({
  type: 'Container',
  label: 'Container',
  category: 'Layout',
  description: 'Layout wrapper with max-width constraint, responsive padding, and surface backgrounds.',
  icon: 'layout',
  canHaveChildren: true,
  fields: {
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      defaultValue: 'wide',
      options: [
        { label: 'Narrow (720px)', value: 'narrow' },
        { label: 'Medium (960px)', value: 'medium' },
        { label: 'Wide (1200px)', value: 'wide' },
        { label: 'Full Width (100%)', value: 'full' },
      ],
    },
    padding: {
      type: 'select',
      label: 'Padding',
      defaultValue: 'medium',
      responsive: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small (1.5rem)', value: 'small' },
        { label: 'Medium (3rem)', value: 'medium' },
        { label: 'Large (5rem)', value: 'large' },
      ],
    },
    background: {
      type: 'select',
      label: 'Background Surface',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Subtle Surface', value: 'subtle' },
        { label: 'Elevated Card', value: 'card' },
      ],
    },
  },
});

/**
 * 5. Card Component (Marketing)
 */
export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Card',
  category: 'Marketing',
  description: 'Feature card with category tag, title, description, and optional link.',
  icon: 'credit-card',
  canHaveChildren: false,
  fields: {
    tag: {
      type: 'text',
      label: 'Badge Tag',
      defaultValue: 'Feature',
    },
    title: {
      type: 'text',
      label: 'Card Title',
      defaultValue: 'Strict JSON State',
    },
    description: {
      type: 'textarea',
      label: 'Description',
      defaultValue: 'Pure serializable document state with stable node IDs and zero hidden DOM references.',
    },
    variant: {
      type: 'select',
      label: 'Card Style',
      defaultValue: 'default',
      options: [
        { label: 'Default Surface', value: 'default' },
        { label: 'Highlighted Glow', value: 'highlight' },
      ],
    },
    buttonText: {
      type: 'text',
      label: 'Button Label (Optional)',
      defaultValue: '',
    },
    buttonUrl: {
      type: 'text',
      label: 'Button URL',
      defaultValue: '#',
    },
  },
});

/**
 * 6. Button Component (Interactive)
 */
export const ButtonComponent = defineComponent({
  type: 'Button',
  label: 'Button',
  category: 'Interactive',
  description: 'Interactive button or anchor link with variant styling.',
  icon: 'mouse-pointer',
  canHaveChildren: false,
  fields: {
    label: {
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Get Started',
    },
    url: {
      type: 'text',
      label: 'Target URL',
      defaultValue: '/editor',
    },
    variant: {
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Gradient)', value: 'primary' },
        { label: 'Secondary (Surface)', value: 'secondary' },
        { label: 'Outline (Border)', value: 'outline' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
  },
});

/**
 * Creates and registers the 6 canonical components into a ComponentRegistry.
 */
export function createNextjsRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();
  registry.register(HeroComponent);
  registry.register(HeadingComponent);
  registry.register(RichTextComponent);
  registry.register(ContainerComponent);
  registry.register(CardComponent);
  registry.register(ButtonComponent);
  return registry;
}

export const canonicalComponentDefinitions = [
  HeroComponent,
  HeadingComponent,
  RichTextComponent,
  ContainerComponent,
  CardComponent,
  ButtonComponent,
];
