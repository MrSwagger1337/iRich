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
import { IRichTextEditor } from './editor';
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

  describe('AST Normalization & Schema Resilience (Bug 1 Fix)', () => {
    // 1. valid listItem -> paragraph -> text
    it('preserves valid listItem -> paragraph -> text AST exactly', () => {
      const validDoc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Valid list item' }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const normalized = ensureRichTextDocument(validDoc);
      expect(normalized).toEqual(validDoc);
    });

    // 2. legacy listItem -> text
    it('deterministically converts legacy listItem -> text to listItem -> paragraph -> text', () => {
      const legacyDoc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Legacy direct text item' }],
              },
            ],
          },
        ],
      } as unknown as RichTextDocument;

      const normalized = ensureRichTextDocument(legacyDoc);
      expect(normalized.content?.[0].content?.[0]).toEqual({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Legacy direct text item' }],
          },
        ],
      });
    });

    // 3. multiple list items
    it('handles multiple list items in bullet and ordered lists', () => {
      const multiDoc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'First item' }],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Second item' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Third item' }],
              },
            ],
          },
        ],
      } as unknown as RichTextDocument;

      const normalized = ensureRichTextDocument(multiDoc);
      const items = normalized.content?.[0].content || [];
      expect(items).toHaveLength(3);
      expect(items[0].content?.[0].type).toBe('paragraph');
      expect(items[1].content?.[0].type).toBe('paragraph');
      expect(items[2].content?.[0].type).toBe('paragraph');
    });

    // 4. nested marks/text where currently supported
    it('preserves nested marks across formatted text nodes during normalization', () => {
      const markedDoc = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'text',
                    text: 'Bold text',
                    marks: [{ type: 'bold' }],
                  },
                  {
                    type: 'text',
                    text: ' and link',
                    marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
                  },
                ],
              },
            ],
          },
        ],
      } as unknown as RichTextDocument;

      const normalized = ensureRichTextDocument(markedDoc);
      const paragraph = normalized.content?.[0].content?.[0].content?.[0];
      expect(paragraph?.type).toBe('paragraph');
      expect(paragraph?.content).toHaveLength(2);
      expect(paragraph?.content?.[0].marks).toEqual([{ type: 'bold' }]);
      expect(paragraph?.content?.[1].marks).toEqual([{ type: 'link', attrs: { href: 'https://example.com' } }]);
    });

    // 5. empty rich-text document
    it('handles empty rich-text document safely', () => {
      expect(ensureRichTextDocument(null)).toEqual(createEmptyRichText());
      expect(ensureRichTextDocument(undefined)).toEqual(createEmptyRichText());
      expect(ensureRichTextDocument({ type: 'doc', content: [] })).toEqual({ type: 'doc', content: [] });
    });

    // 6. malformed unsupported structure
    it('handles malformed and unsupported structures predictably without throwing', () => {
      // Non-doc type
      expect(ensureRichTextDocument({ type: 'invalid' } as unknown as RichTextDocument)).toEqual(createEmptyRichText());
      // Direct string primitive
      const fromStr = ensureRichTextDocument('Raw String Paragraph');
      expect(fromStr.type).toBe('doc');
      expect(fromStr.content?.[0].type).toBe('paragraph');
      // Root-level raw text node without block wrapping
      const rawTextDoc = {
        type: 'doc',
        content: [{ type: 'text', text: 'Unwrapped Root Text' }],
      } as unknown as RichTextDocument;
      const normalizedRoot = ensureRichTextDocument(rawTextDoc);
      expect(normalizedRoot.content?.[0].type).toBe('paragraph');
      expect(normalizedRoot.content?.[0].content?.[0].text).toBe('Unwrapped Root Text');
    });

    // 7. valid input is not modified unnecessarily
    it('does not modify valid standard inputs unnecessarily', () => {
      const headingDoc: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Section Heading' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Body paragraph text.' }],
          },
        ],
      };

      const normalized = ensureRichTextDocument(headingDoc);
      expect(normalized).toEqual(headingDoc);
    });

    // 8. editor initialization no longer throws contentMatchAt for original playground document
    it('initializes IRichTextEditor without contentMatchAt error for playground sample AST', () => {
      const originalPlaygroundAst = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: '✦ Structured Rich-Text Authoring' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'iRich incorporates ' },
              { type: 'text', text: 'first-class rich text editing', marks: [{ type: 'bold' }] },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Strictly JSON-serializable ProseMirror AST' }],
              },
              {
                type: 'listItem',
                content: [{ type: 'text', text: 'Lightweight SSR-safe production renderer' }],
              },
            ],
          },
        ],
      } as unknown as RichTextDocument;

      // Rendering IRichTextEditor with this legacy AST must normalize safely and mount cleanly without error
      expect(() => {
        act(() => {
          root?.render(
            <IRichTextEditor
              content={originalPlaygroundAst}
              editable={true}
            />
          );
        });
      }).not.toThrow();

      expect(container?.querySelector('.irich-rich-editor-container, .irich-rich-text-content, .irich-rich-editor-ssr')).toBeTruthy();
      expect(container?.textContent).toContain('Structured Rich-Text Authoring');
    });
  });

  describe('Multilingual, RTL/LTR & Bidi Direction Support', () => {
    it('applies dir="rtl" and lang="ar" to IRichTextRenderer root container', () => {
      act(() => {
        root?.render(
          <IRichTextRenderer
            content="مرحبا بالعالم"
            dir="rtl"
            lang="ar"
          />
        );
      });

      const element = container?.querySelector('.irich-rich-text-content');
      expect(element).toBeTruthy();
      expect(element?.getAttribute('dir')).toBe('rtl');
      expect(element?.getAttribute('lang')).toBe('ar');
      expect(element?.textContent).toContain('مرحبا بالعالم');
    });

    it('applies dir="auto" to IRichTextRenderer for browser bidi resolution', () => {
      act(() => {
        root?.render(
          <IRichTextRenderer
            content="Mixed direction content"
            dir="auto"
          />
        );
      });

      const element = container?.querySelector('.irich-rich-text-content');
      expect(element).toBeTruthy();
      expect(element?.getAttribute('dir')).toBe('auto');
    });

    it('preserves Arabic Unicode, numbers, ISO standard, and mixed English in IRichTextRenderer', () => {
      const arabicTechnicalAst: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'المعايير الدولية للذكاء الاصطناعي' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'تم اعتماد ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'ISO/IEC 42001:2023' },
              { type: 'text', text: ' كمعيار دولي لإدارة أنظمة ' },
              { type: 'text', marks: [{ type: 'code' }], text: 'AI Governance' },
              { type: 'text', text: ' بنسبة تفوق 99.9% في عام 2026.' },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'الشفافية وقابلية التدقيق هي حجر الأساس.' }],
              },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'إدارة المخاطر التقنية' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'الامتثال للمعايير الأوروبية' }] }],
              },
            ],
          },
        ],
      };

      act(() => {
        root?.render(
          <IRichTextRenderer
            content={arabicTechnicalAst}
            dir="rtl"
            lang="ar"
          />
        );
      });

      const text = container?.textContent;
      expect(text).toContain('المعايير الدولية للذكاء الاصطناعي');
      expect(text).toContain('ISO/IEC 42001:2023');
      expect(text).toContain('AI Governance');
      expect(text).toContain('99.9%');
      expect(text).toContain('2026');
      expect(text).toContain('الشفافية وقابلية التدقيق هي حجر الأساس.');
      expect(text).toContain('إدارة المخاطر التقنية');
      expect(container?.querySelector('blockquote.irich-rich-blockquote')).toBeTruthy();
      expect(container?.querySelector('ul.irich-rich-bullet-list')).toBeTruthy();
    });

    it('defaults codeBlock to dir="ltr" while allowing explicit override', () => {
      const codeAst: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            content: [{ type: 'text', text: 'const answer = 42;' }],
          },
          {
            type: 'codeBlock',
            attrs: { dir: 'auto' },
            content: [{ type: 'text', text: '// تعليق برمجي' }],
          },
        ],
      };

      act(() => {
        root?.render(
          <IRichTextRenderer
            content={codeAst}
            dir="rtl"
            lang="ar"
          />
        );
      });

      const codeBlocks = container?.querySelectorAll('.irich-rich-code-block');
      expect(codeBlocks).toHaveLength(2);
      expect(codeBlocks?.[0].getAttribute('dir')).toBe('ltr');
      expect(codeBlocks?.[1].getAttribute('dir')).toBe('auto');
    });

    it('forwards dir and lang to IRichTextEditor container and attributes', () => {
      act(() => {
        root?.render(
          <IRichTextEditor
            content="محتوى عربي تفاعلي"
            dir="rtl"
            lang="ar"
            editable={true}
          />
        );
      });

      const editorContainer = container?.querySelector('.irich-rich-editor-container, .irich-rich-editor-ssr');
      expect(editorContainer).toBeTruthy();
      expect(editorContainer?.getAttribute('dir')).toBe('rtl');
      expect(editorContainer?.getAttribute('lang')).toBe('ar');
    });

    it('direction changes do NOT mutate the canonical AST content', () => {
      const originalAst: RichTextDocument = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'نص غير قابل للتغيير بفعل تغيير الاتجاه' }],
          },
        ],
      };

      const clone = JSON.parse(JSON.stringify(originalAst));

      // Render in RTL
      act(() => {
        root?.render(<IRichTextRenderer content={originalAst} dir="rtl" />);
      });
      expect(originalAst).toEqual(clone);

      // Render in LTR
      act(() => {
        root?.render(<IRichTextRenderer content={originalAst} dir="ltr" />);
      });
      expect(originalAst).toEqual(clone);
    });
  });
});


