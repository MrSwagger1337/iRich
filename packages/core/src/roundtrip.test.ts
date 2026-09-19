import { describe, it, expect } from 'vitest';
import {
  createDocument,
  createNode,
  createComponentRegistry,
  defineComponent,
  formatDocumentJSON,
  parseDocumentJSON,
  validateDocumentJSON,
  type IRichDocument,
} from './index';

describe('Headless JSON Round-Trip & Diagnostics (@irich/core)', () => {
  function setupRegistry() {
    const registry = createComponentRegistry();

    registry.register(
      defineComponent({
        type: 'Section',
        label: 'Section Container',
        fields: {
          title: { type: 'text', defaultValue: '' },
        },
      }),
    );

    registry.register(
      defineComponent({
        type: 'Callout',
        label: 'Callout Box',
        canHaveChildren: true,
        fields: {
          variant: {
            type: 'select',
            options: [
              { label: 'Insight', value: 'insight' },
              { label: 'Warning', value: 'warning' },
              { label: 'Info', value: 'info' },
            ],
            defaultValue: 'insight',
          },
        },
      }),
    );

    registry.register(
      defineComponent({
        type: 'Heading',
        label: 'Heading',
        canHaveChildren: false,
        fields: {
          text: { type: 'text', defaultValue: 'Heading' },
          align: {
            type: 'select',
            options: [
              { label: 'Start', value: 'start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'end' },
            ],
            defaultValue: 'start',
            responsive: true,
          },
        },
      }),
    );

    registry.register(
      defineComponent({
        type: 'Quote',
        label: 'Quote',
        canHaveChildren: false,
        fields: {
          text: { type: 'text', defaultValue: '' },
          author: { type: 'text', defaultValue: '' },
        },
      }),
    );

    registry.register(
      defineComponent({
        type: 'CardGrid',
        label: 'Card Grid',
        allowedChildren: ['Card'],
        fields: {
          columns: { type: 'number', defaultValue: 3, min: 1, max: 6 },
        },
      }),
    );

    registry.register(
      defineComponent({
        type: 'Card',
        label: 'Card',
        allowedParents: ['CardGrid', 'Section', 'root'],
        fields: {
          title: { type: 'text', defaultValue: 'Card Title' },
        },
      }),
    );

    return registry;
  }

  describe('Document Round-Trip (Export -> Parse -> Validate -> Restore)', () => {
    it('successfully round-trips a complex multilingual editorial document', () => {
      const registry = setupRegistry();

      const originalDoc: IRichDocument = createDocument({
        metadata: {
          locale: 'ar',
          direction: 'rtl',
          title: 'دليل الذكاء الاصطناعي الحديث',
          description: 'A comprehensive guide to AI visual editing with multilingual support.',
        },
        root: {
          children: [
            createNode({
              id: 'heading-1',
              type: 'Heading',
              props: {
                text: 'مقدمة في بناء الصفحات البصرية',
                align: {
                  desktop: 'start',
                  mobile: 'center',
                },
              },
            }),
            createNode({
              id: 'callout-1',
              type: 'Callout',
              props: {
                variant: 'insight',
              },
              children: [
                createNode({
                  id: 'quote-en',
                  type: 'Quote',
                  props: {
                    text: 'The future of visual content editing is structured, safe, and portable.',
                    author: 'DeepMind Engineer',
                  },
                  meta: {
                    dir: 'ltr',
                    lang: 'en',
                  },
                }),
              ],
            }),
            createNode({
              id: 'grid-1',
              type: 'CardGrid',
              props: { columns: 3 },
              children: [
                createNode({ id: 'card-1', type: 'Card', props: { title: 'البطاقة الأولى 🚀' } }),
                createNode({ id: 'card-2', type: 'Card', props: { title: 'Card Two with French: Café' } }),
                createNode({ id: 'card-3', type: 'Card', props: { title: 'Dutch: Gezellig ontwerp' } }),
              ],
            }),
          ],
        },
      });

      // 1. Format to deterministic JSON string
      const jsonString = formatDocumentJSON(originalDoc);
      expect(typeof jsonString).toBe('string');
      expect(jsonString).toContain('دليل الذكاء الاصطناعي الحديث');
      expect(jsonString).toContain('"direction": "rtl"');
      expect(jsonString).toContain('"dir": "ltr"');

      // 2. Parse JSON
      const parseResult = parseDocumentJSON<IRichDocument>(jsonString);
      expect(parseResult.success).toBe(true);

      // 3. Validate JSON document against registry
      const validation = validateDocumentJSON(jsonString, { registry });
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.details).toHaveLength(0);

      // 4. Verify identical data preservation
      if (parseResult.success) {
        expect(parseResult.data).toEqual(originalDoc);
      }
    });
  });

  describe('Structured Diagnostics & Invalid Document Rejections', () => {
    it('returns structured diagnostic on raw JSON syntax error', () => {
      const invalidJson = '{\n  "version": "1.0.0",\n  "root": {';
      const result = validateDocumentJSON(invalidJson);

      expect(result.valid).toBe(false);
      expect(result.details).toHaveLength(1);
      expect(result.details[0].code).toBe('INVALID_JSON');
      expect(result.details[0].path).toBe('$');
      expect(result.details[0].message).toContain('JSON syntax error');
    });

    it('returns structured diagnostic on empty string input', () => {
      const result = validateDocumentJSON('   ');
      expect(result.valid).toBe(false);
      expect(result.details[0].code).toBe('INVALID_JSON');
      expect(result.details[0].message).toBe('Cannot parse empty JSON string.');
    });

    it('identifies duplicate NodeIds with exact node context', () => {
      const docWithDuplicates = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            { id: 'node-duplicate', type: 'Heading', props: { text: 'One' } },
            { id: 'node-duplicate', type: 'Heading', props: { text: 'Two' } },
          ],
        },
      };

      const result = validateDocumentJSON(docWithDuplicates);
      expect(result.valid).toBe(false);
      const dupError = result.details.find((d) => d.code === 'DUPLICATE_NODE_ID');
      expect(dupError).toBeDefined();
      expect(dupError?.nodeId).toBe('node-duplicate');
      expect(dupError?.nodeType).toBe('Heading');
    });

    it('identifies unregistered component types with exact node context', () => {
      const registry = setupRegistry();
      const docWithUnknown = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            { id: 'unreg-1', type: 'MarketingBannerV2', props: {} },
          ],
        },
      };

      const result = validateDocumentJSON(docWithUnknown, { registry });
      expect(result.valid).toBe(false);
      const err = result.details.find((d) => d.code === 'UNKNOWN_COMPONENT');
      expect(err).toBeDefined();
      expect(err?.nodeId).toBe('unreg-1');
      expect(err?.nodeType).toBe('MarketingBannerV2');
      expect(err?.message).toContain('MarketingBannerV2');
    });

    it('identifies invalid component placement (child inside non-container)', () => {
      const registry = setupRegistry();
      const docWithIllegalNesting = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            {
              id: 'heading-leaf',
              type: 'Heading', // canHaveChildren: false
              props: { text: 'Leaf' },
              children: [
                { id: 'card-inside-heading', type: 'Card', props: { title: 'Illegal' } },
              ],
            },
          ],
        },
      };

      const result = validateDocumentJSON(docWithIllegalNesting, { registry });
      expect(result.valid).toBe(false);
      const err = result.details.find((d) => d.code === 'INVALID_PLACEMENT');
      expect(err).toBeDefined();
      expect(err?.nodeId).toBe('card-inside-heading');
      expect(err?.message).toContain('does not allow direct child nodes');
    });

    it('identifies invalid prop values against schema (unknown select option)', () => {
      const registry = setupRegistry();
      const docWithInvalidProp = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            {
              id: 'callout-4',
              type: 'Callout',
              props: {
                variant: 'purpleMega', // Not in ['insight', 'warning', 'info']
              },
            },
          ],
        },
      };

      const result = validateDocumentJSON(docWithInvalidProp, { registry });
      expect(result.valid).toBe(false);
      const propErr = result.details.find((d) => d.code === 'INVALID_PROP');
      expect(propErr).toBeDefined();
      expect(propErr?.nodeId).toBe('callout-4');
      expect(propErr?.nodeType).toBe('Callout');
      expect(propErr?.propName).toBe('variant');
      expect(propErr?.message).toContain('purpleMega');
    });

    it('rejects prototype pollution keys safely', () => {
      const dangerousPayload = {
        version: '1.0.0',
        __proto__: { admin: true },
        root: {
          id: 'root',
          type: 'root',
          props: {},
          meta: {
            constructor: 'polluted',
          },
        },
      };

      const result = validateDocumentJSON(dangerousPayload);
      expect(result.valid).toBe(false);
      expect(result.details.some((d) => d.code === 'UNSAFE_VALUE')).toBe(true);
    });

    it('rejects circular object references', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circularDoc: any = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [],
        },
      };
      // Create a cycle
      circularDoc.root.children.push(circularDoc.root);

      const result = validateDocumentJSON(circularDoc);
      expect(result.valid).toBe(false);
      expect(result.details.some((d) => d.code === 'CYCLIC_REFERENCE')).toBe(true);
    });
  });
});
