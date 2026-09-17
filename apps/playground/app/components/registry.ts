/**
 * Framework-independent component definitions and registry for iRich Playground.
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
  description: 'Flexible layout container for grouping and padding child elements.',
  icon: 'layout',
  fields: {
    padding: {
      type: 'select',
      label: 'Padding',
      defaultValue: 'medium',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
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
    background: {
      type: 'select',
      label: 'Background',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Subtle Slate', value: 'subtle' },
        { label: 'Card Surface', value: 'card' },
      ],
    },
    layout: {
      type: 'select',
      label: 'Layout Direction',
      defaultValue: 'vertical',
      options: [
        { label: 'Vertical (Stack)', value: 'vertical' },
        { label: 'Horizontal (2-Column Grid)', value: 'grid-2' },
        { label: 'Horizontal (3-Column Grid)', value: 'grid-3' },
      ],
    },
  },
});

export const HeadingComponent = defineComponent({
  type: 'Heading',
  label: 'Heading',
  category: 'Content',
  description: 'Section heading with customizable hierarchy and alignment.',
  icon: 'heading',
  fields: {
    text: {
      type: 'text',
      label: 'Heading Text',
      defaultValue: 'Section Heading',
      required: true,
    },
    level: {
      type: 'select',
      label: 'Hierarchy Level',
      defaultValue: 'h2',
      options: [
        { label: 'H1 - Main Title', value: 'h1' },
        { label: 'H2 - Section Title', value: 'h2' },
        { label: 'H3 - Subheading', value: 'h3' },
        { label: 'H4 - Small Heading', value: 'h4' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
});

export const TextComponent = defineComponent({
  type: 'Text',
  label: 'Paragraph Text',
  category: 'Content',
  description: 'Body text paragraph with typography styling options.',
  icon: 'type',
  fields: {
    content: {
      type: 'textarea',
      label: 'Content',
      defaultValue:
        'iRich provides a robust visual content editor combining rich-text flexibility with modular component layouts.',
      required: true,
    },
    size: {
      type: 'select',
      label: 'Text Size',
      defaultValue: 'md',
      options: [
        { label: 'Small (14px)', value: 'sm' },
        { label: 'Medium (16px)', value: 'md' },
        { label: 'Large (18px)', value: 'lg' },
        { label: 'Lead (20px)', value: 'lead' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (High Contrast)', value: 'primary' },
        { label: 'Muted (Secondary)', value: 'muted' },
        { label: 'Accent (Indigo)', value: 'accent' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  },
});

export const ButtonComponent = defineComponent({
  type: 'Button',
  label: 'Button',
  category: 'Content',
  description: 'Call-to-action button with interactive hover states.',
  icon: 'mouse-pointer',
  fields: {
    label: {
      type: 'text',
      label: 'Button Text',
      defaultValue: 'Get Started',
      required: true,
    },
    variant: {
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Gradient)', value: 'primary' },
        { label: 'Secondary (Solid Dark)', value: 'secondary' },
        { label: 'Outline (Border)', value: 'outline' },
        { label: 'Ghost (Transparent)', value: 'ghost' },
      ],
    },
    size: {
      type: 'select',
      label: 'Button Size',
      defaultValue: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    url: {
      type: 'text',
      label: 'Link URL',
      defaultValue: '#',
    },
  },
});

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Card',
  category: 'Marketing',
  description: 'Interactive container card with tag badge, title, and description.',
  icon: 'credit-card',
  fields: {
    title: {
      type: 'text',
      label: 'Card Title',
      defaultValue: 'Feature Highlight',
      required: true,
    },
    description: {
      type: 'textarea',
      label: 'Description',
      defaultValue: 'Deliver modern React visual page building with clean serializable state.',
    },
    tag: {
      type: 'text',
      label: 'Badge Tag',
      defaultValue: 'Core Feature',
    },
    variant: {
      type: 'select',
      label: 'Card Variant',
      defaultValue: 'elevated',
      options: [
        { label: 'Elevated (Glass Shadow)', value: 'elevated' },
        { label: 'Outlined (Border)', value: 'outlined' },
        { label: 'Subtle (Fill)', value: 'subtle' },
      ],
    },
  },
});

export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  description: 'Large high-impact hero header with badge, title, subtitle, and CTA.',
  icon: 'sparkles',
  fields: {
    badge: {
      type: 'text',
      label: 'Eyebrow Badge',
      defaultValue: '✦ Introducing iRich Editor v0.1.0',
    },
    title: {
      type: 'text',
      label: 'Headline Title',
      defaultValue: 'The Extensible Visual Content Editor for React',
      required: true,
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle Description',
      defaultValue:
        'Bridge structured rich-text authoring with modular component-based page composition in pure React and Next.js.',
    },
    align: {
      type: 'select',
      label: 'Alignment',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
    primaryActionLabel: {
      type: 'text',
      label: 'Primary CTA Label',
      defaultValue: 'Explore Documentation',
    },
    secondaryActionLabel: {
      type: 'text',
      label: 'Secondary CTA Label',
      defaultValue: 'View on GitHub',
    },
  },
});

/**
 * Creates and initializes the playground component registry.
 */
export function createPlaygroundRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();
  registry.register(ContainerComponent);
  registry.register(HeadingComponent);
  registry.register(TextComponent);
  registry.register(ButtonComponent);
  registry.register(CardComponent);
  registry.register(HeroComponent);
  return registry;
}

export const playgroundComponentsList = [
  ContainerComponent,
  HeadingComponent,
  TextComponent,
  ButtonComponent,
  CardComponent,
  HeroComponent,
];
