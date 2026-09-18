/**
 * @vitest-environment jsdom
 *
 * @irich/rich-text
 * Unit and integration tests for rich-text subsystem.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEmptyRichText,
  createRichTextFromText,
  ensureRichTextDocument,
  isRichTextDocument,
  richTextToPlainText,
} from './utils';
import { createRichTextPlugin } from './index';
import { IRichTextRenderer } from './renderer';
import { RichTextToolbar } from './toolbar';
import type { IRichTextController, RichTextDocument } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Rich Text Subsystem (@irich/rich-text)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  describe('AST Utilities', () => {
    it('creates an empty RichTextDocument structure', () => {
      const emptyDoc = createEmptyRichText();
      expect(emptyDoc.type).toBe('doc');
      expect(emptyDoc.content).toHaveLength(1);
      expect(emptyDoc.content?.[0].type).toBe('paragraph');
    });

    it('creates RichTextDocument from plain text strings', () => {
      const text = 'First paragraph\n\nSecond paragraph';
      const doc = createRichTextFromText(text);

      expect(doc.type).toBe('doc');
      expect(doc.content).toHaveLength(2);
      expect(doc.content?.[0].content?.[0].text).toBe('First paragraph');
      expect(doc.content?.[1].content?.[0].text).toBe('Second paragraph');
    });

    it('correctly validates RichTextDocument schema', () => {
      expect(isRichTextDocument({ type: 'doc', content: [] })).toBe(true);
      expect(isRichTextDocument({ type: 'paragraph' })).toBe(false);
      expect(isRichTextDocument(null)).toBe(false);
      expect(isRichTextDocument('not an object')).toBe(false);
    });

    it('extracts plain text from rich text AST structures', () => {
      const doc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            content: [{ type: 'text', text: 'Headline' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello ', marks: [{ type: 'bold' }] },
              { type: 'text', text: 'World!' },
            ],
          },
        ],
      };

      const plainText = richTextToPlainText(doc);
      expect(plainText).toContain('Headline');
      expect(plainText).toContain('Hello');
      expect(plainText).toContain('World!');
    });

    it('ensures input is always a valid RichTextDocument', () => {
      const fromNull = ensureRichTextDocument(null);
      expect(fromNull.type).toBe('doc');

      const fromString = ensureRichTextDocument('Sample text');
      expect(fromString.type).toBe('doc');
      expect(fromString.content?.[0].content?.[0].text).toBe('Sample text');

      const validDoc: RichTextDocument = { type: 'doc', content: [] };
      expect(ensureRichTextDocument(validDoc)).toBe(validDoc);
    });
  });

  describe('IRichTextRenderer (Server-Safe AST Rendering)', () => {
    it('renders basic paragraphs and headings with proper semantic tags', () => {
      const doc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Top Title' }],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Sub heading' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'A normal paragraph.' }],
          },
        ],
      };

      act(() => {
        root?.render(<IRichTextRenderer content={doc} />);
      });

      const h1 = container?.querySelector('h1');
      expect(h1).toBeTruthy();
      expect(h1?.textContent).toBe('Top Title');

      const h3 = container?.querySelector('h3');
      expect(h3).toBeTruthy();
      expect(h3?.textContent).toBe('Sub heading');

      const p = container?.querySelector('p');
      expect(p).toBeTruthy();
      expect(p?.textContent).toBe('A normal paragraph.');
    });

    it('renders inline marks (bold, italic, strike, code, link)', () => {
      const doc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Bold Text', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' ' },
              { type: 'text', text: 'Italic Text', marks: [{ type: 'italic' }] },
              { type: 'text', text: ' ' },
              { type: 'text', text: 'Strike Text', marks: [{ type: 'strike' }] },
              { type: 'text', text: ' ' },
              { type: 'text', text: 'const x = 1;', marks: [{ type: 'code' }] },
              {
                type: 'text',
                text: 'Visit Website',
                marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
              },
            ],
          },
        ],
      };

      act(() => {
        root?.render(<IRichTextRenderer content={doc} />);
      });

      expect(container?.querySelector('strong')?.textContent).toBe('Bold Text');
      expect(container?.querySelector('em')?.textContent).toBe('Italic Text');
      expect(container?.querySelector('s')?.textContent).toBe('Strike Text');
      expect(container?.querySelector('code')?.textContent).toBe('const x = 1;');

      const link = container?.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.textContent).toBe('Visit Website');
    });

    it('renders lists, blockquotes, and code blocks', () => {
      const doc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Item 1' }],
              },
            ],
          },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Step 1' }],
              },
            ],
          },
          {
            type: 'blockquote',
            content: [{ type: 'text', text: 'Quoted block' }],
          },
          {
            type: 'codeBlock',
            content: [{ type: 'text', text: 'function test() {}' }],
          },
        ],
      };

      act(() => {
        root?.render(<IRichTextRenderer content={doc} />);
      });

      expect(container?.querySelector('ul > li')?.textContent).toBe('Item 1');
      expect(container?.querySelector('ol > li')?.textContent).toBe('Step 1');
      expect(container?.querySelector('blockquote')?.textContent).toBe('Quoted block');
      expect(container?.querySelector('pre > code')?.textContent).toBe('function test() {}');
    });

    it('renders gracefully with raw string or null fallback', () => {
      act(() => {
        root?.render(<IRichTextRenderer content="Simple string content" />);
      });
      expect(container?.querySelector('p')?.textContent).toBe('Simple string content');

      act(() => {
        root?.render(<IRichTextRenderer content={null} />);
      });
      expect(container?.querySelector('.irich-rich-text-content')).toBeTruthy();
    });
  });

  describe('RichTextToolbar', () => {
    it('dispatches format actions to the controller', () => {
      const mockController: IRichTextController = {
        isEditable: true,
        isActive: vi.fn((name) => name === 'bold'),
        canUndo: vi.fn(() => true),
        canRedo: vi.fn(() => false),
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
        toggleStrike: vi.fn(),
        toggleCode: vi.fn(),
        toggleBlockquote: vi.fn(),
        toggleHeading: vi.fn(),
        setParagraph: vi.fn(),
        toggleBulletList: vi.fn(),
        toggleOrderedList: vi.fn(),
        setLink: vi.fn(),
        unsetLink: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        setContent: vi.fn(),
        getJSON: vi.fn(() => createEmptyRichText()),
        getPlainText: vi.fn(() => ''),
        focus: vi.fn(),
        blur: vi.fn(),
      };

      const handleDone = vi.fn();

      act(() => {
        root?.render(<RichTextToolbar controller={mockController} onDone={handleDone} />);
      });

      // Check active class on Bold button
      const boldBtn = container?.querySelector('button[aria-label="Bold"]');
      expect(boldBtn?.classList.contains('active')).toBe(true);

      // Click Italic button
      const italicBtn = container?.querySelector('button[aria-label="Italic"]') as HTMLButtonElement;
      act(() => {
        italicBtn?.click();
      });
      expect(mockController.toggleItalic).toHaveBeenCalledTimes(1);

      // Click Heading 1 button
      const h1Btn = container?.querySelector('button[aria-label="Heading 1"]') as HTMLButtonElement;
      act(() => {
        h1Btn?.click();
      });
      expect(mockController.toggleHeading).toHaveBeenCalledWith(1);

      // Click Bullet list button
      const bulletBtn = container?.querySelector('button[aria-label="Bullet list"]') as HTMLButtonElement;
      act(() => {
        bulletBtn?.click();
      });
      expect(mockController.toggleBulletList).toHaveBeenCalledTimes(1);

      // Click Undo button
      const undoBtn = container?.querySelector('button[aria-label="Undo"]') as HTMLButtonElement;
      act(() => {
        undoBtn?.click();
      });
      expect(mockController.undo).toHaveBeenCalledTimes(1);

      // Click Done button
      const doneBtn = container?.querySelector('button[aria-label="Finish editing"]') as HTMLButtonElement;
      act(() => {
        doneBtn?.click();
      });
      expect(handleDone).toHaveBeenCalledTimes(1);
    });
  });

  describe('Plugin API', () => {
    it('creates rich-text plugin definition', () => {
      const plugin = createRichTextPlugin();
      expect(plugin.name).toBe('rich-text');
      expect(plugin.version).toBe('0.1.0');
    });
  });
});
