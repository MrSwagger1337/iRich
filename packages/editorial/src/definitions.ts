/**
 * @irich/editorial
 * Component definitions, schemas, and placement grammar for canonical editorial vocabulary.
 * Strictly framework-independent, declared using @irich/core.
 */

import {
  createComponentRegistry,
  defineComponent,
  type ComponentDefinition,
  type ComponentRegistry,
  type FieldDefinition,
} from '@irich/core';
import { isSafeHref, isSafeImageSrc } from './security';

/**
 * 1. Section Component (Structural Grouping)
 */
export const SectionComponent = defineComponent({
  type: 'Section',
  label: 'Section',
  category: 'Layout',
  description: 'Semantic structural grouping for organizing related editorial content and themes.',
  icon: 'layout',
  canHaveChildren: true,
  fields: {
    variant: {
      type: 'select',
      label: 'Section Surface',
      defaultValue: 'default',
      options: [
        { label: 'Default (Transparent)', value: 'default' },
        { label: 'Muted (Subtle Tint)', value: 'muted' },
        { label: 'Accent (Highlight)', value: 'accent' },
      ],
    },
    spacing: {
      type: 'select',
      label: 'Vertical Spacing',
      defaultValue: 'normal',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ],
    },
  },
});

/**
 * 2. Columns Component (2-Column Editorial Grid)
 */
export const ColumnsComponent = defineComponent({
  type: 'Columns',
  label: 'Columns (2-Column Grid)',
  category: 'Layout',
  description:
    'Two-column editorial layout block. Must contain exactly two Column children for complete content.',
  icon: 'columns',
  canHaveChildren: true,
  allowedChildren: ['Column'],
  fields: {
    layout: {
      type: 'select',
      label: 'Column Proportions',
      defaultValue: 'equal',
      options: [
        { label: 'Equal (1fr / 1fr)', value: 'equal' },
        { label: 'Start Narrow (1fr / 2fr)', value: 'start-narrow' },
        { label: 'End Narrow (2fr / 1fr)', value: 'end-narrow' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Column Gap',
      defaultValue: 'normal',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ],
    },
  },
});

/**
 * 3. Column Component (Internal Structural Node)
 */
export const ColumnComponent = defineComponent({
  type: 'Column',
  label: 'Column',
  category: 'Layout (Internal)',
  description:
    'Internal column container node inside a 2-column Columns block. Not a top-level palette component.',
  icon: 'sidebar',
  canHaveChildren: true,
  allowedParents: ['Columns'],
  fields: {},
});

/**
 * 4. Image Component (Structured Figure with Caption & Credit)
 */
export const ImageComponent = defineComponent({
  type: 'Image',
  label: 'Image / Figure',
  category: 'Media',
  description:
    'Structured editorial figure with image source, required accessibility alt text, and optional caption/credit.',
  icon: 'image',
  canHaveChildren: false,
  fields: {
    src: {
      type: 'text',
      label: 'Image URL',
      placeholder: 'https://images.unsplash.com/...',
      defaultValue: '',
    },
    alt: {
      type: 'text',
      label: 'Alt Text (Required for accessibility)',
      placeholder: 'Descriptive text for screen readers',
      defaultValue: '',
    },
    caption: {
      type: 'text',
      label: 'Caption',
      placeholder: 'Optional caption describing the image...',
      defaultValue: '',
    },
    credit: {
      type: 'text',
      label: 'Photo / Media Credit',
      placeholder: 'Photo: Author / Agency',
      defaultValue: '',
    },
    aspect: {
      type: 'select',
      label: 'Aspect Ratio',
      defaultValue: 'auto',
      options: [
        { label: 'Auto / Natural', value: 'auto' },
        { label: '16:9 Widescreen', value: '16-9' },
        { label: '4:3 Standard', value: '4-3' },
        { label: '1:1 Square', value: '1-1' },
        { label: 'Wide Banner (21:9)', value: 'wide' },
      ],
    },
  },
});

/**
 * 5. Callout Component (Contextual Aside & Notice)
 */
export const CalloutComponent = defineComponent({
  type: 'Callout',
  label: 'Callout',
  category: 'Editorial',
  description:
    'Contextual aside, notice, or highlighted supporting information distinct from main prose.',
  icon: 'info',
  canHaveChildren: true,
  allowedChildren: ['Heading', 'RichText'],
  fields: {
    variant: {
      type: 'select',
      label: 'Callout Variant',
      defaultValue: 'info',
      options: [
        { label: 'Info (Blue)', value: 'info' },
        { label: 'Insight (Purple)', value: 'insight' },
        { label: 'Warning (Amber)', value: 'warning' },
        { label: 'Success (Green)', value: 'success' },
      ],
    },
  },
});

/**
 * 6. Quote Component (Pull Quote with Structured Attribution)
 */
export const QuoteComponent = defineComponent({
  type: 'Quote',
  label: 'Pull Quote',
  category: 'Editorial',
  description:
    'Featured quotation block with citation attribution and source. Contains a RichText child for the quote content.',
  icon: 'quote',
  canHaveChildren: true,
  allowedChildren: ['RichText'],
  fields: {
    attribution: {
      type: 'text',
      label: 'Attribution (Speaker/Author)',
      placeholder: 'e.g. Marie Curie',
      defaultValue: '',
    },
    source: {
      type: 'text',
      label: 'Source (Publication/Context)',
      placeholder: 'e.g. Nobel Lecture (1911)',
      defaultValue: '',
    },
    variant: {
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default Quote', value: 'default' },
        { label: 'Featured Pull Quote', value: 'featured' },
      ],
    },
  },
});

/**
 * 7. KeyTakeaway Component (Core Conclusion & Executive Summary)
 */
export const KeyTakeawayComponent = defineComponent({
  type: 'KeyTakeaway',
  label: 'Key Takeaway',
  category: 'Editorial',
  description:
    'Concise central lesson, high-value finding, or core editorial summary distinct from casual callouts.',
  icon: 'check-circle',
  canHaveChildren: true,
  allowedChildren: ['Heading', 'RichText'],
  fields: {
    variant: {
      type: 'select',
      label: 'Takeaway Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default (Bordered Surface)', value: 'default' },
        { label: 'Emphasized (Glow Accent)', value: 'emphasized' },
      ],
    },
  },
});

/**
 * 8. Card Component (Compositional Editorial Card)
 */
export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Card',
  category: 'Editorial',
  description:
    'Compositional editorial card block with surface framing for features, steps, or profiles.',
  icon: 'credit-card',
  canHaveChildren: true,
  allowedChildren: ['Heading', 'RichText', 'Button', 'Image'],
  fields: {
    variant: {
      type: 'select',
      label: 'Card Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default Surface', value: 'default' },
        { label: 'Outlined', value: 'outlined' },
        { label: 'Elevated (Shadow)', value: 'elevated' },
      ],
    },
  },
});

/**
 * 9. CardGrid Component (Multi-Card Container)
 */
export const CardGridComponent = defineComponent({
  type: 'CardGrid',
  label: 'Card Grid',
  category: 'Layout',
  description:
    'Responsive grid container for displaying multiple peer Card items. Must contain only Card children.',
  icon: 'grid',
  canHaveChildren: true,
  allowedChildren: ['Card'],
  fields: {
    columns: {
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Grid Gap',
      defaultValue: 'normal',
      options: [
        { label: 'Compact', value: 'compact' },
        { label: 'Normal', value: 'normal' },
        { label: 'Spacious', value: 'spacious' },
      ],
    },
  },
});

/**
 * 10. Button Component (Styled Editorial Link)
 */
export const ButtonComponent = defineComponent({
  type: 'Button',
  label: 'Button Link',
  category: 'Interactive',
  description:
    'Published link styled as a button. Navigates to a target URL (safe https, http, relative, or anchor link).',
  icon: 'mouse-pointer',
  canHaveChildren: false,
  fields: {
    label: {
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Learn More',
    },
    href: {
      type: 'text',
      label: 'Target URL',
      defaultValue: '#',
    },
    variant: {
      type: 'select',
      label: 'Style Variant',
      defaultValue: 'primary',
      options: [
        { label: 'Primary (Accent)', value: 'primary' },
        { label: 'Secondary (Surface)', value: 'secondary' },
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
  },
});

/**
 * 11. CTA Component (Call-to-Action Region)
 */
export const CTAComponent = defineComponent({
  type: 'CTA',
  label: 'Call to Action (CTA)',
  category: 'Marketing',
  description:
    'Action-oriented concluding or promotional region leading readers toward a next step or link.',
  icon: 'sparkles',
  canHaveChildren: true,
  allowedChildren: ['Heading', 'RichText', 'Button'],
  fields: {
    variant: {
      type: 'select',
      label: 'CTA Style',
      defaultValue: 'default',
      options: [
        { label: 'Default Surface', value: 'default' },
        { label: 'Emphasized Accent', value: 'emphasized' },
      ],
    },
  },
});

/**
 * 12. Heading Component (Structured Typography)
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
      defaultValue: 'Section Heading',
    },
    level: {
      type: 'select',
      label: 'Hierarchy Level',
      defaultValue: 'h2',
      options: [
        { label: 'H1 - Main Title', value: 'h1' },
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
        { label: 'Start / Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'End / Right', value: 'right' },
      ],
    },
    color: {
      type: 'select',
      label: 'Color Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Muted', value: 'muted' },
        { label: 'Accent Gradient', value: 'gradient' },
      ],
    },
  },
});

/**
 * 13. RichText Component (Rich Prose Typography Schema)
 */
export const RichTextComponent = defineComponent({
  type: 'RichText',
  label: 'Rich Text',
  category: 'Typography',
  description: 'Multi-line formatted rich text block supporting inline styles and paragraphs.',
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

/**
 * 14. Container Component (Layout Wrapper)
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
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    background: {
      type: 'select',
      label: 'Background Surface',
      defaultValue: 'transparent',
      options: [
        { label: 'Transparent', value: 'transparent' },
        { label: 'Subtle Surface', value: 'subtle' },
        { label: 'Card Surface', value: 'card' },
      ],
    },
  },
});

/**
 * Array of all 14 canonical editorial component definitions.
 */
export const editorialDefinitions: readonly ComponentDefinition[] = [
  SectionComponent,
  ColumnsComponent,
  ColumnComponent,
  ImageComponent,
  CalloutComponent,
  QuoteComponent,
  KeyTakeawayComponent,
  CardComponent,
  CardGridComponent,
  ButtonComponent,
  CTAComponent,
  HeadingComponent,
  RichTextComponent,
  ContainerComponent,
];

/**
 * Creates a pre-populated ComponentRegistry configured with all canonical editorial component
 * definitions and strict URL security validation handlers.
 */
export function createEditorialRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();

  // Register strict URL validation on text fields for Button.href and Image.src
  registry.registerFieldType({
    type: 'text',
    validate(value: unknown, field: FieldDefinition) {
      if (value === undefined || value === null || value === '') {
        return { valid: true };
      }
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected a string, got ${typeof value}` };
      }

      // If this is an Image URL field, enforce safe image URL (no data:, blob:, etc.)
      if (field.label?.includes('Image URL') || field.description?.includes('Image URL')) {
        if (!isSafeImageSrc(value)) {
          return {
            valid: false,
            error: `Unsafe image URL scheme detected. Only "https:", "http:", and safe relative URLs are allowed.`,
          };
        }
      }

      // If this is a link/href field, enforce safe navigation URL
      if (field.label?.includes('Target URL') || field.label?.includes('Destination URL')) {
        if (!isSafeHref(value)) {
          return {
            valid: false,
            error: `Unsafe URL scheme detected. "javascript:", "vbscript:", and dangerous "data:" URLs are forbidden.`,
          };
        }
      }

      return { valid: true };
    },
  });

  // Register all canonical editorial components
  for (const definition of editorialDefinitions) {
    registry.register(definition);
  }

  return registry;
}
