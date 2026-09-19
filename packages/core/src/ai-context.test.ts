import { describe, expect, it } from 'vitest';
import { generateDocumentAIContext } from './ai-context';
import { defineComponent } from './component/definition';
import { createComponentRegistry } from './component/registry';
import { createDocument, createNode } from './utils/tree';

describe('generateDocumentAIContext', () => {
  it('generates structured prompt with document JSON and rules without registry', () => {
    const doc = createDocument({
      metadata: { title: 'Test Document', locale: 'en', direction: 'ltr' },
      root: {
        children: [createNode({ type: 'Paragraph', props: { content: 'Hello world' } })],
      },
    });


    const prompt = generateDocumentAIContext(doc);

    expect(prompt).toContain('# iRich Document Assistant');
    expect(prompt).toContain('Strict Structural & Architectural Rules');
    expect(prompt).toContain('Current Canonical Document JSON');
    expect(prompt).toContain('"Test Document"');
    expect(prompt).toContain('"Hello world"');
    expect(prompt).toContain('Return ONLY a single, strictly valid iRich document');
  });

  it('includes custom task instructions if provided', () => {
    const doc = createDocument();
    const prompt = generateDocumentAIContext(doc, {
      instructions: 'Restructure this landing page into a 3-column feature comparison.',
    });

    expect(prompt).toContain('## Task Instructions');
    expect(prompt).toContain('Restructure this landing page into a 3-column feature comparison.');
  });

  it('extracts all component schemas, fields, types, options, and slots from ComponentRegistry faithfully', () => {
    const registry = createComponentRegistry();

    registry.register(
      defineComponent({
        type: 'Hero',
        label: 'Hero Section',
        category: 'Marketing',
        description: 'Main promotional banner.',
        fields: {
          title: { type: 'text', label: 'Headline', defaultValue: 'Welcome' },
          alignment: {
            type: 'select',
            label: 'Text Alignment',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
            ],
            defaultValue: 'center',
          },
          padding: {
            type: 'number',
            label: 'Vertical Padding',
            min: 16,
            max: 128,
            unit: 'px',
            defaultValue: 64,
          },
        },
        slots: {
          actions: { label: 'Call to Actions', maxChildren: 2, allowedTypes: ['Button'] },
        },
        allowedParents: ['root', 'Container'],
      }),
    );

    const doc = createDocument();
    const prompt = generateDocumentAIContext(doc, { registry });

    expect(prompt).toContain('## Available Component Types (1 Registered)');
    expect(prompt).toContain('### Component: "Hero"');
    expect(prompt).toContain('- **Label**: Hero Section');
    expect(prompt).toContain('- **Category**: Marketing');
    expect(prompt).toContain('- **Description**: Main promotional banner.');
    expect(prompt).toContain('`title` (type: `text`, label: "Headline", default: "Welcome")');
    expect(prompt).toContain('`alignment` (type: `select`, label: "Text Alignment", default: "center", options: ["left", "center"])');
    expect(prompt).toContain('`padding` (type: `number`, label: "Vertical Padding", default: 64, min: 16, max: 128, unit: "px")');
    expect(prompt).toContain('`actions` (label: "Call to Actions", maxChildren: 2, allowedTypes: ["Button"])');
    expect(prompt).toContain('- **Allowed Parents**: ["root", "Container"]');

  });
});
