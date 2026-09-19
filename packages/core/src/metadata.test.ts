import { describe, it, expect } from 'vitest';
import {
  createDocument,
  createNode,
  cloneNode,
  validateDocument,
  type IRichDirection,
  type IRichDocument,
  type IRichNode,
} from './index';

describe('Document & Node Metadata (@irich/core)', () => {
  describe('Document Metadata (locale, direction, custom)', () => {
    it('creates document with Arabic locale and RTL direction', () => {
      const doc = createDocument({
        metadata: {
          locale: 'ar',
          direction: 'rtl',
          title: 'مقال تجريبي',
        },
      });

      expect(doc.metadata?.locale).toBe('ar');
      expect(doc.metadata?.direction).toBe('rtl');
      expect(doc.metadata?.title).toBe('مقال تجريبي');
    });

    it('creates document with English locale and LTR direction', () => {
      const doc = createDocument({
        metadata: {
          locale: 'en-US',
          direction: 'ltr',
          title: 'Editorial Article',
        },
      });

      expect(doc.metadata?.locale).toBe('en-US');
      expect(doc.metadata?.direction).toBe('ltr');
    });

    it('supports direction: "auto"', () => {
      const doc = createDocument({
        metadata: {
          direction: 'auto' as IRichDirection,
        },
      });

      expect(doc.metadata?.direction).toBe('auto');
      const validation = validateDocument(doc);
      expect(validation.valid).toBe(true);
    });

    it('rejects invalid direction value in metadata', () => {
      const doc = {
        version: '1.0.0',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          direction: 'vertical' as any,
        },
        root: {
          id: 'root',
          type: 'root',
          props: {},
        },
      };

      const validation = validateDocument(doc);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Invalid document direction'))).toBe(true);
      expect(validation.details.some((d) => d.code === 'INVALID_DIRECTION')).toBe(true);
    });

    it('preserves arbitrary Unicode and multilingual characters in metadata without corruption', () => {
      const multilingualMeta = {
        arabic: 'مرحبا بالعالم',
        french: 'Bonjour le monde, déjà vu & café',
        dutch: 'Hallo wereld, gezellig',
        japanese: 'こんにちは世界',
        emojis: '🚀✨🌍',
      };

      const doc = createDocument({
        metadata: multilingualMeta,
      });

      expect(doc.metadata?.arabic).toBe('مرحبا بالعالم');
      expect(doc.metadata?.french).toBe('Bonjour le monde, déjà vu & café');
      expect(doc.metadata?.dutch).toBe('Hallo wereld, gezellig');
      expect(doc.metadata?.japanese).toBe('こんにちは世界');
      expect(doc.metadata?.emojis).toBe('🚀✨🌍');
    });
  });

  describe('Node-Level Metadata Overrides (dir, lang, custom)', () => {
    it('creates node with local LTR direction and English lang override inside RTL doc', () => {
      const quoteNode = createNode({
        id: 'quote-1',
        type: 'Quote',
        props: { text: 'To be or not to be.' },
        meta: {
          dir: 'ltr',
          lang: 'en',
        },
      });

      expect(quoteNode.meta?.dir).toBe('ltr');
      expect(quoteNode.meta?.lang).toBe('en');

      const arabicArticle = createDocument({
        metadata: {
          locale: 'ar',
          direction: 'rtl',
        },
        root: {
          children: [
            createNode({
              id: 'arabic-p1',
              type: 'Paragraph',
              props: { content: 'هذا نص باللغة العربية' },
            }),
            quoteNode,
          ],
        },
      });

      const validation = validateDocument(arabicArticle);
      expect(validation.valid).toBe(true);
    });

    it('rejects invalid direction on node meta', () => {
      const invalidNodeDoc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            {
              id: 'node-1',
              type: 'Callout',
              props: {},
              meta: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dir: 'sideways' as any,
              },
            },
          ],
        },
      };

      const validation = validateDocument(invalidNodeDoc);
      expect(validation.valid).toBe(false);
      expect(validation.details.some((d) => d.code === 'INVALID_DIRECTION' && d.nodeId === 'node-1')).toBe(true);
    });

    it('preserves node meta during cloneNode without reference sharing', () => {
      const original: IRichNode = createNode({
        id: 'code-1',
        type: 'CodeBlock',
        props: { code: 'const x = 1;' },
        meta: {
          dir: 'ltr',
          lang: 'typescript',
          locked: true,
        },
      });

      const cloned = cloneNode(original, false);
      expect(cloned.meta).toEqual(original.meta);
      expect(cloned.meta).not.toBe(original.meta); // Immutability / separate object
    });
  });
});
