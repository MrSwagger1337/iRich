import { describe, it, expect } from 'vitest';
import { validateDocument, type IRichDocument } from '@irich/core';
import {
  createEditorialRegistry,
  editorialDefinitions,
} from './definitions';

describe('@irich/editorial Component Definitions & Placement Rules', () => {
  const registry = createEditorialRegistry();

  it('registers all 14 canonical editorial components', () => {
    expect(editorialDefinitions.length).toBe(14);
    expect(registry.getAll().length).toBe(14);
    expect(registry.has('Section')).toBe(true);
    expect(registry.has('Columns')).toBe(true);
    expect(registry.has('Column')).toBe(true);
    expect(registry.has('Image')).toBe(true);
    expect(registry.has('Callout')).toBe(true);
    expect(registry.has('Quote')).toBe(true);
    expect(registry.has('KeyTakeaway')).toBe(true);
    expect(registry.has('Card')).toBe(true);
    expect(registry.has('CardGrid')).toBe(true);
    expect(registry.has('Button')).toBe(true);
    expect(registry.has('CTA')).toBe(true);
    expect(registry.has('Heading')).toBe(true);
    expect(registry.has('RichText')).toBe(true);
    expect(registry.has('Container')).toBe(true);
  });

  it('validates prop schemas and variants', () => {
    const calloutValidation = registry.validateProps('Callout', { variant: 'insight' });
    expect(calloutValidation.valid).toBe(true);

    const invalidCalloutValidation = registry.validateProps('Callout', { variant: 'invalid-var' });
    expect(invalidCalloutValidation.valid).toBe(false);

    const columnsValidation = registry.validateProps('Columns', { layout: 'start-narrow', gap: 'compact' });
    expect(columnsValidation.valid).toBe(true);

    const invalidColumnsValidation = registry.validateProps('Columns', { layout: '33-33-33' });
    expect(invalidColumnsValidation.valid).toBe(false);
  });

  it('enforces CardGrid allows only Card direct children', () => {
    const validDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'grid-1',
            type: 'CardGrid',
            props: { columns: '2' },
            children: [
              { id: 'card-1', type: 'Card', props: {}, children: [] },
              { id: 'card-2', type: 'Card', props: {}, children: [] },
            ],
          },
        ],
      },
    };

    const validResult = validateDocument(validDoc, { registry });
    expect(validResult.valid).toBe(true);

    const invalidDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'grid-1',
            type: 'CardGrid',
            props: { columns: '2' },
            children: [
              { id: 'text-1', type: 'RichText', props: { content: '<p>Direct text in grid</p>' } },
            ],
          },
        ],
      },
    };

    const invalidResult = validateDocument(invalidDoc, { registry });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some((e) => e.includes('not permitted as a child of "CardGrid"'))).toBe(true);
  });

  it('enforces Column is only allowed inside Columns', () => {
    const invalidDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'col-1',
            type: 'Column',
            props: {},
            children: [],
          },
        ],
      },
    };

    const result = validateDocument(invalidDoc, { registry });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('only allowed inside parents of type [Columns]'))).toBe(true);
  });

  it('enforces CTA allowed children (Heading, RichText, Button) and rejects Card', () => {
    const invalidDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'cta-1',
            type: 'CTA',
            props: {},
            children: [
              { id: 'card-1', type: 'Card', props: {}, children: [] },
            ],
          },
        ],
      },
    };

    const result = validateDocument(invalidDoc, { registry });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not permitted as a child of "CTA"'))).toBe(true);
  });

  it('enforces Quote allows only RichText children', () => {
    const invalidDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'quote-1',
            type: 'Quote',
            props: { attribution: 'Test Author' },
            children: [
              { id: 'btn-1', type: 'Button', props: { label: 'Click' } },
            ],
          },
        ],
      },
    };

    const result = validateDocument(invalidDoc, { registry });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not permitted as a child of "Quote"'))).toBe(true);
  });
});
