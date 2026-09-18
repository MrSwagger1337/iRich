/**
 * @irich/rich-text
 * AST utilities, document constructors, and plain text converters.
 */

import type { RichTextDocument, RichTextNode } from './types';

/**
 * Creates a valid, empty RichTextDocument containing a single paragraph.
 */
export function createEmptyRichText(): RichTextDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
      },
    ],
  };
}

/**
 * Creates a valid RichTextDocument from a raw string, preserving paragraph line breaks.
 */
export function createRichTextFromText(text: string): RichTextDocument {
  if (!text || typeof text !== 'string') {
    return createEmptyRichText();
  }

  const paragraphs = text.split(/\r?\n\r?\n/);
  const content: RichTextNode[] = paragraphs.map((para) => {
    const trimmed = para.trim();
    if (!trimmed) {
      return { type: 'paragraph' };
    }
    return {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: trimmed,
        },
      ],
    };
  });

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  };
}

/**
 * Determines whether a value satisfies the RichTextDocument AST schema.
 */
export function isRichTextDocument(val: unknown): val is RichTextDocument {
  if (!val || typeof val !== 'object') {
    return false;
  }
  const obj = val as Record<string, unknown>;
  return obj.type === 'doc' && (!obj.content || Array.isArray(obj.content));
}

/**
 * Normalizes a document, string, or undefined input into a guaranteed RichTextDocument AST.
 */
export function ensureRichTextDocument(
  val: RichTextDocument | string | null | undefined,
): RichTextDocument {
  if (!val) {
    return createEmptyRichText();
  }
  if (typeof val === 'string') {
    return createRichTextFromText(val);
  }
  if (isRichTextDocument(val)) {
    return val;
  }
  return createEmptyRichText();
}

/**
 * Recursively extracts plain text content from a RichTextDocument or AST node.
 */
export function richTextToPlainText(
  docOrNode: RichTextDocument | RichTextNode | string | null | undefined,
): string {
  if (!docOrNode) return '';
  if (typeof docOrNode === 'string') return docOrNode;

  if ('text' in docOrNode && typeof docOrNode.text === 'string') {
    return docOrNode.text;
  }

  if (docOrNode.content && Array.isArray(docOrNode.content)) {
    return docOrNode.content
      .map((child) => richTextToPlainText(child))
      .filter(Boolean)
      .join('\n');
  }

  return '';
}
