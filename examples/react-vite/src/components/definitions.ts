/**
 * Framework-independent component definitions and registry for Vite React example.
 */

import {
  createComponentRegistry,
  defineComponent,
  type ComponentRegistry,
} from '@irich/core';

export const ContainerComponent = defineComponent({
  type: 'Container',
  label: 'Container',
  category: 'Layout',
  description: 'Flexible layout container with max-width and responsive padding.',
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
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    background: {
      type: 'select',
      label: 'Background Style',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Subtle Surface', value: 'subtle' },
        { label: 'Elevated Card', value: 'card' },
      ],
    },
  },
});

export const HeadingComponent = defineComponent({
  type: 'Heading',
  label: 'Heading',
  category: 'Typography',
  description: 'Structured headline with hierarchy levels and alignment.',
  icon: 'heading',
  canHaveChildren: false,
  fields: {
    text: {
      type: 'text',
      label: 'Heading Text',
      defaultValue: 'Vite + React Integration',
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      defaultValue: 'h2',
      options: [
        { label: 'H1 - Title', value: 'h1' },
        { label: 'H2 - Section Title', value: 'h2' },
        { label: 'H3 - Subheading', value: 'h3' },
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
  },
});

export const RichTextComponent = defineComponent({
  type: 'RichText',
  label: 'Rich Text',
  category: 'Typography',
  description: 'Multi-line formatted rich text block.',
  icon: 'file-text',
  canHaveChildren: false,
  fields: {
    placeholder: {
      type: 'text',
      label: 'Placeholder Text',
      defaultValue: 'Type formatted text here...',
    },
  },
});

export const ButtonComponent = defineComponent({
  type: 'Button',
  label: 'Button',
  category: 'Interactive',
  description: 'Interactive button with variant styling.',
  icon: 'mouse-pointer',
  canHaveChildren: false,
  fields: {
    label: {
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Click Me',
    },
    url: {
      type: 'text',
      label: 'Link URL',
      defaultValue: '#',
    },
    variant: {
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Vite Purple)', value: 'primary' },
        { label: 'Secondary (Surface)', value: 'secondary' },
        { label: 'Outline (Border)', value: 'outline' },
      ],
    },
  },
});

export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  description: 'High-impact landing hero with badge, headline, and actions.',
  icon: 'sparkles',
  canHaveChildren: false,
  fields: {
    badge: {
      type: 'text',
      label: 'Eyebrow Badge',
      defaultValue: '⚡ Built with React + Vite',
    },
    title: {
      type: 'text',
      label: 'Headline Title',
      defaultValue: 'Framework-Independent Visual Editing in Pure Vite',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle Description',
      defaultValue:
        'Verify that iRich executes natively in standalone Vite and React environments without any Next.js dependencies.',
    },
    primaryActionText: {
      type: 'text',
      label: 'Primary Action Label',
      defaultValue: 'Explore Components',
    },
    primaryActionUrl: {
      type: 'text',
      label: 'Primary Action URL',
      defaultValue: '#features',
    },
  },
});

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Feature Card',
  category: 'Marketing',
  description: 'Feature highlight card with title, description, and status tag.',
  icon: 'credit-card',
  canHaveChildren: false,
  fields: {
    title: {
      type: 'text',
      label: 'Card Title',
      defaultValue: 'Zero Meta-Framework Lock-in',
    },
    description: {
      type: 'textarea',
      label: 'Description',
      defaultValue: '@irich/core runs cleanly in browser, node, and worker environments.',
    },
    tag: {
      type: 'text',
      label: 'Badge Tag',
      defaultValue: 'Vite Verified',
    },
  },
});

export const AlertComponent = defineComponent({
  type: 'Alert',
  label: 'Notification Alert',
  category: 'Content',
  description: 'Callout notification banner with variant types.',
  icon: 'alert-circle',
  canHaveChildren: false,
  fields: {
    message: {
      type: 'text',
      label: 'Alert Message',
      defaultValue: 'Standalone React + Vite environment verified with zero Next.js dependencies.',
    },
    type: {
      type: 'select',
      label: 'Alert Type',
      defaultValue: 'info',
      options: [
        { label: 'Info (Cyan)', value: 'info' },
        { label: 'Success (Green)', value: 'success' },
        { label: 'Warning (Amber)', value: 'warning' },
      ],
    },
  },
});

export function createViteRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();
  registry.register(HeroComponent);
  registry.register(CardComponent);
  registry.register(AlertComponent);
  registry.register(HeadingComponent);
  registry.register(RichTextComponent);
  registry.register(ButtonComponent);
  registry.register(ContainerComponent);
  return registry;
}

export const viteSampleComponents = [
  HeroComponent,
  CardComponent,
  AlertComponent,
  HeadingComponent,
  RichTextComponent,
  ButtonComponent,
  ContainerComponent,
];
