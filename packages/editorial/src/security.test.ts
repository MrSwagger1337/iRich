import { describe, it, expect } from 'vitest';
import { validateDocument, type IRichDocument } from '@irich/core';
import { isSafeHref, isSafeImageSrc, sanitizeHref, sanitizeImageSrc } from './security';
import { createEditorialRegistry } from './definitions';

describe('@irich/editorial Security Validation & Sanitization', () => {
  const registry = createEditorialRegistry();

  describe('isSafeHref', () => {
    it('allows safe web and relative URLs', () => {
      expect(isSafeHref('https://example.com/article')).toBe(true);
      expect(isSafeHref('http://example.com')).toBe(true);
      expect(isSafeHref('/editor')).toBe(true);
      expect(isSafeHref('#features')).toBe(true);
      expect(isSafeHref('mailto:author@example.com')).toBe(true);
      expect(isSafeHref('tel:+1234567890')).toBe(true);
      expect(isSafeHref('')).toBe(true);
      expect(isSafeHref(undefined)).toBe(true);
    });

    it('strictly rejects javascript: and other dangerous schemes', () => {
      expect(isSafeHref('javascript:alert(1)')).toBe(false);
      expect(isSafeHref('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeHref('  javascript:void(0)')).toBe(false);
      expect(isSafeHref('\x00javascript:alert(1)')).toBe(false);
      expect(isSafeHref('vbscript:msgbox("xss")')).toBe(false);
      expect(isSafeHref('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
      expect(isSafeHref('blob:http://example.com/uuid')).toBe(false);
    });
  });

  describe('isSafeImageSrc', () => {
    it('allows safe http, https, and relative image paths', () => {
      expect(isSafeImageSrc('https://images.unsplash.com/photo-123')).toBe(true);
      expect(isSafeImageSrc('http://example.com/image.png')).toBe(true);
      expect(isSafeImageSrc('/images/hero.jpg')).toBe(true);
      expect(isSafeImageSrc('./assets/card.webp')).toBe(true);
    });

    it('strictly rejects data:, blob:, and javascript: schemes in Phase 6', () => {
      expect(isSafeImageSrc('javascript:alert(1)')).toBe(false);
      expect(isSafeImageSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=')).toBe(false);
      expect(isSafeImageSrc('blob:http://example.com/uuid')).toBe(false);
      expect(isSafeImageSrc('vbscript:msgbox(1)')).toBe(false);
    });
  });

  describe('Defense-in-depth sanitizers', () => {
    it('sanitizes unsafe href to fallback', () => {
      expect(sanitizeHref('javascript:alert(1)', '#')).toBe('#');
      expect(sanitizeHref('https://safe.com', '#')).toBe('https://safe.com');
    });

    it('sanitizes unsafe image src to empty string', () => {
      expect(sanitizeImageSrc('javascript:alert(1)', '')).toBe('');
      expect(sanitizeImageSrc('data:image/png;base64,123', '')).toBe('');
      expect(sanitizeImageSrc('https://safe.com/img.png', '')).toBe('https://safe.com/img.png');
    });
  });

  describe('Document Validation with Registry URL handlers', () => {
    it('rejects document with unsafe Button href', () => {
      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            {
              id: 'btn-unsafe',
              type: 'Button',
              props: {
                label: 'Click Me',
                href: 'javascript:alert(document.cookie)',
              },
            },
          ],
        },
      };

      const result = validateDocument(doc, { registry });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unsafe URL scheme detected'))).toBe(true);
    });
  });
});
