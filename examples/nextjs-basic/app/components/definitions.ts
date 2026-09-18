/**
 * @irich/core component definitions for Next.js example.
 * Strictly framework-independent declarations of component schemas, slots, and fields.
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
        { label: 'Small (1rem)', value: 'small' },
        { label: 'Medium (2rem)', value: 'medium' },
        { label: 'Large (4rem)', value: 'large' },
      ],
    },
    background: {
      type: 'select',
      label: 'Background Style',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Subtle Slate', value: 'subtle' },
        { label: 'Card Surface', value: 'card' },
        { label: 'Gradient Glow', value: 'gradient' },
      ],
    },
    layout: {
      type: 'select',
      label: 'Layout Direction',
      defaultValue: 'stack',
      responsive: true,
      options: [
        { label: 'Vertical Stack', value: 'stack' },
        { label: '2-Column Grid', value: 'grid-2' },
        { label: '3-Column Grid', value: 'grid-3' },
        { label: 'Row (Flex)', value: 'row' },
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
      defaultValue: 'Modern Page Building',
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      defaultValue: 'h2',
      options: [
        { label: 'H1 - Page Headline', value: 'h1' },
        { label: 'H2 - Section Title', value: 'h2' },
        { label: 'H3 - Subsection Heading', value: 'h3' },
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
      defaultValue: 'primary',
      options: [
        { label: 'Primary White', value: 'primary' },
        { label: 'Muted Gray', value: 'muted' },
        { label: 'Indigo Gradient', value: 'gradient' },
        { label: 'Accent Cyan', value: 'accent' },
      ],
    },
  },
});

export const RichTextComponent = defineComponent({
  type: 'RichText',
  label: 'Rich Text',
  category: 'Typography',
  description: 'Formatted prose with headings, lists, bold/italic, and quotes.',
  icon: 'file-text',
  canHaveChildren: false,
  fields: {
    placeholder: {
      type: 'text',
      label: 'Placeholder Text',
      defaultValue: 'Click to format rich text...',
    },
  },
});

export const ButtonComponent = defineComponent({
  type: 'Button',
  label: 'Button',
  category: 'Interactive',
  description: 'Interactive call-to-action button or link.',
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
      label: 'Button Style',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Gradient)', value: 'primary' },
        { label: 'Secondary (Dark Surface)', value: 'secondary' },
        { label: 'Outline (Border)', value: 'outline' },
        { label: 'Ghost (Transparent)', value: 'ghost' },
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

export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  description: 'High-impact landing hero with eyebrow badge, title, subtitle, and dual CTA buttons.',
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
    primaryCtaText: {
      type: 'text',
      label: 'Primary CTA Label',
      defaultValue: 'Open Visual Editor',
    },
    primaryCtaUrl: {
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
      defaultValue: '#features',
    },
  },
});

export const FeatureCardComponent = defineComponent({
  type: 'FeatureCard',
  label: 'Feature Card',
  category: 'Marketing',
  description: 'Feature highlight card with icon, badge, title, and description.',
  icon: 'credit-card',
  canHaveChildren: false,
  allowedParents: ['Features', 'Container', 'root'],
  fields: {
    icon: {
      type: 'select',
      label: 'Card Icon',
      defaultValue: 'sparkles',
      options: [
        { label: '✨ Sparkles / AI', value: 'sparkles' },
        { label: '⚡ Fast / Engine', value: 'zap' },
        { label: '🛡️ Shield / Security', value: 'shield' },
        { label: '🧱 Layers / Modular', value: 'layers' },
        { label: '💻 Code / React', value: 'code' },
        { label: '💾 Database / JSON', value: 'database' },
      ],
    },
    title: {
      type: 'text',
      label: 'Feature Title',
      defaultValue: 'Strict JSON State',
    },
    description: {
      type: 'textarea',
      label: 'Feature Description',
      defaultValue: 'Pure serializable document state without hidden DOM references or runtime closures.',
    },
    tag: {
      type: 'text',
      label: 'Category Tag',
      defaultValue: 'Architecture',
    },
    color: {
      type: 'select',
      label: 'Accent Color',
      defaultValue: 'indigo',
      options: [
        { label: 'Indigo Glow', value: 'indigo' },
        { label: 'Purple Aura', value: 'purple' },
        { label: 'Emerald Cyan', value: 'emerald' },
        { label: 'Amber Flame', value: 'amber' },
        { label: 'Rose Pink', value: 'rose' },
      ],
    },
  },
});

export const FeaturesComponent = defineComponent({
  type: 'Features',
  label: 'Features Grid',
  category: 'Marketing',
  description: 'Section container for showcasing multiple FeatureCard items in a responsive grid.',
  icon: 'grid',
  canHaveChildren: true,
  allowedChildren: ['FeatureCard'],
  fields: {
    sectionTitle: {
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Architected for Developer Productivity',
    },
    sectionSubtitle: {
      type: 'textarea',
      label: 'Section Subtitle',
      defaultValue: 'Explore the core engineering principles that power the iRich visual engine.',
    },
    columns: {
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '3',
      responsive: true,
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    align: {
      type: 'select',
      label: 'Header Alignment',
      defaultValue: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
      ],
    },
  },
});

export const CTAComponent = defineComponent({
  type: 'CTA',
  label: 'Call to Action',
  category: 'Marketing',
  description: 'High-conversion callout section with headline, description, and action button.',
  icon: 'megaphone',
  canHaveChildren: false,
  fields: {
    headline: {
      type: 'text',
      label: 'CTA Headline',
      defaultValue: 'Ready to Build with iRich in Next.js?',
    },
    description: {
      type: 'textarea',
      label: 'Description',
      defaultValue: 'Embed visual editing into your existing React & Next.js applications in minutes.',
    },
    buttonText: {
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Launch Interactive Editor',
    },
    buttonUrl: {
      type: 'text',
      label: 'Button URL',
      defaultValue: '/editor',
    },
    variant: {
      type: 'select',
      label: 'Visual Style',
      defaultValue: 'gradient',
      options: [
        { label: 'Gradient Mesh', value: 'gradient' },
        { label: 'Dark Glow Surface', value: 'glow' },
        { label: 'Clean Outlined Card', value: 'card' },
      ],
    },
  },
});

/**
 * Creates and configures the component registry for the Next.js example.
 */
export function createNextjsRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();
  registry.register(HeroComponent);
  registry.register(FeaturesComponent);
  registry.register(FeatureCardComponent);
  registry.register(CTAComponent);
  registry.register(HeadingComponent);
  registry.register(RichTextComponent);
  registry.register(ButtonComponent);
  registry.register(ContainerComponent);
  return registry;
}

export const sampleComponentDefinitions = [
  HeroComponent,
  FeaturesComponent,
  FeatureCardComponent,
  CTAComponent,
  HeadingComponent,
  RichTextComponent,
  ButtonComponent,
  ContainerComponent,
];
