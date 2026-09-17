# iRich Component Definition API

> Schema definitions, prop descriptors, slot declarations, and renderer mapping for **iRich** components.

---

## 1. Component Definition Contract

All application components available within iRich are declared through a declarative **Component Definition** (`ComponentDefinition<Props>`). This ensures strict type-safety, automatic Property Inspector generation, default prop validation, and clean renderer decoupling.

```typescript
import type React from 'react';
import type { JSONValue } from '@irich/core';

/**
 * Prop field type descriptors for the visual Property Inspector.
 */
export type PropFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'richText'
  | 'object'
  | 'array';

export interface BaseFieldSchema {
  type: PropFieldType;
  label?: string;
  description?: string;
  placeholder?: string;
}

export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text' | 'textarea';
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
}

export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface BooleanFieldSchema extends BaseFieldSchema {
  type: 'boolean';
  defaultValue?: boolean;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select';
  options: SelectOption[];
  defaultValue?: string | number;
}

export interface ColorFieldSchema extends BaseFieldSchema {
  type: 'color';
  defaultValue?: string;
}

export interface ImageFieldSchema extends BaseFieldSchema {
  type: 'image';
  defaultValue?: string;
}

export interface RichTextFieldSchema extends BaseFieldSchema {
  type: 'richText';
  defaultValue?: string;
}

export interface ObjectFieldSchema extends BaseFieldSchema {
  type: 'object';
  fields: Record<string, PropFieldSchema>;
}

export interface ArrayFieldSchema extends BaseFieldSchema {
  type: 'array';
  itemSchema: PropFieldSchema;
  defaultValue?: JSONValue[];
}

export type PropFieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | BooleanFieldSchema
  | SelectFieldSchema
  | ColorFieldSchema
  | ImageFieldSchema
  | RichTextFieldSchema
  | ObjectFieldSchema
  | ArrayFieldSchema;

export type PropSchema<P> = {
  [K in keyof P]: PropFieldSchema;
};

/**
 * Slot / Dropzone specification for nesting child components.
 */
export interface SlotDefinition {
  /**
   * Human-readable name displayed in the visual editor breadcrumb & slot outline.
   */
  label?: string;

  /**
   * Optional array of component types allowed in this slot.
   * If omitted, any registered component can be placed here.
   */
  allowedTypes?: string[];

  /**
   * Maximum number of child nodes permitted in this slot.
   */
  maxChildren?: number;
}

/**
 * Full component specification registered in iRich.
 */
export interface ComponentDefinition<
  P extends Record<string, JSONValue> = Record<string, JSONValue>,
> {
  /**
   * Unique name of the component (matches `node.type`).
   */
  name: string;

  /**
   * Human-readable title shown in the component palette / block drawer.
   */
  label: string;

  /**
   * Category grouping in the block picker (e.g. 'Layout', 'Typography', 'Media', 'Marketing').
   */
  category?: string;

  /**
   * Icon identifier or SVG element.
   */
  icon?: string;

  /**
   * Default prop values assigned upon insertion.
   */
  defaultProps: P;

  /**
   * Prop schema for inspector field generation.
   */
  props: PropSchema<P>;

  /**
   * Slot definitions for multi-zone nesting.
   */
  slots?: Record<string, SlotDefinition>;

  /**
   * Production and preview React component renderer.
   */
  render: React.ComponentType<
    P & { children?: React.ReactNode; slots?: Record<string, React.ReactNode> }
  >;
}
```

---

## 2. Component Registration Helper

```typescript
export function defineComponent<P extends Record<string, JSONValue>>(
  definition: ComponentDefinition<P>,
): ComponentDefinition<P> {
  return definition;
}
```

---

## 3. Concrete TypeScript Component Examples

### Example 1: `HeroBlock` (Content + Visual Settings)

```typescript
import React from 'react';
import { defineComponent } from '@irich/core';

interface HeroProps {
  title: string;
  subtitle: string;
  alignment: 'left' | 'center' | 'right';
  backgroundColor: string;
  showButton: boolean;
  buttonLabel: string;
  buttonUrl: string;
}

export const HeroBlock = defineComponent<HeroProps>({
  name: 'Hero',
  label: 'Hero Section',
  category: 'Marketing',
  defaultProps: {
    title: 'Design Without Limits',
    subtitle: 'Build stunning pages with the visual ergonomics of iRich.',
    alignment: 'center',
    backgroundColor: '#0f172a',
    showButton: true,
    buttonLabel: 'Get Started',
    buttonUrl: 'https://github.com/MrSwagger1337/iRich',
  },
  props: {
    title: { type: 'text', label: 'Headline' },
    subtitle: { type: 'textarea', label: 'Sub-headline' },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    backgroundColor: { type: 'color', label: 'Background Color' },
    showButton: { type: 'boolean', label: 'Show Call to Action' },
    buttonLabel: { type: 'text', label: 'Button Label' },
    buttonUrl: { type: 'text', label: 'Button Destination' },
  },
  render: ({ title, subtitle, alignment, backgroundColor, showButton, buttonLabel, buttonUrl }) => {
    return (
      <section style={{ backgroundColor, textAlign: alignment, padding: '4rem 2rem', color: '#fff' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>{title}</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          {subtitle}
        </p>
        {showButton && (
          <a
            href={buttonUrl}
            style={{
              display: 'inline-block',
              background: '#38bdf8',
              color: '#0f172a',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            {buttonLabel}
          </a>
        )}
      </section>
    );
  },
});
```

---

### Example 2: `SplitColumnsBlock` (Multi-Slot Dropzone)

```typescript
import React from 'react';
import { defineComponent } from '@irich/core';

interface SplitColumnsProps {
  ratio: '50-50' | '33-66' | '66-33';
  gap: number;
}

export const SplitColumnsBlock = defineComponent<SplitColumnsProps>({
  name: 'SplitColumns',
  label: 'Two Columns',
  category: 'Layout',
  defaultProps: {
    ratio: '50-50',
    gap: 24,
  },
  props: {
    ratio: {
      type: 'select',
      label: 'Column Ratio',
      options: [
        { label: '50% / 50%', value: '50-50' },
        { label: '33% / 66%', value: '33-66' },
        { label: '66% / 33%', value: '66-33' },
      ],
    },
    gap: { type: 'number', label: 'Gap (px)', min: 0, max: 64, step: 4 },
  },
  slots: {
    left: { label: 'Left Column' },
    right: { label: 'Right Column' },
  },
  render: ({ ratio, gap, slots }) => {
    const gridTemplate =
      ratio === '33-66' ? '1fr 2fr' : ratio === '66-33' ? '2fr 1fr' : '1fr 1fr';

    return (
      <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: `${gap}px` }}>
        <div data-slot="left">{slots?.left}</div>
        <div data-slot="right">{slots?.right}</div>
      </div>
    );
  },
});
```

---

## 4. Edit Mode vs. Production Rendering

To preserve performance and ensure clean SSR:

1. The `render` function declared in `ComponentDefinition` is **identical in both edit mode and published mode**.
2. In edit mode, `@irich/react` injects interactive dropzone boundaries and canvas overlays around the component without altering the component's internal markup or requiring conditional `if (isEditing)` checks inside customer components.
