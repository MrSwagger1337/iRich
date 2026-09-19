/**
 * @irich/rich-text
 * AST utilities, document constructors, and plain text converters.
 */

import type { JSONValue } from '@irich/core';
import type { RichTextDocument, RichTextMark, RichTextNode } from './types';

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
 * Normalizes an individual rich-text AST node, safely converting legacy or loose structures
 * (such as listItem -> text) into schema-valid ProseMirror blocks (listItem -> paragraph -> text).
 */
function normalizeAstNode(node: unknown): RichTextNode | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const raw = node as Record<string, unknown>;
  const type = typeof raw.type === 'string' ? raw.type : '';
  if (!type) {
    return null;
  }

  // 1. Text leaf node
  if (type === 'text') {
    return {
      type: 'text',
      text: typeof raw.text === 'string' ? raw.text : '',
      ...(Array.isArray(raw.marks) ? { marks: raw.marks } : {}),
    };
  }

  // 2. List item node - ensure contents are wrapped in block nodes (e.g. paragraph)
  if (type === 'listItem') {
    const rawContent = Array.isArray(raw.content) ? raw.content : [];
    if (rawContent.length === 0) {
      return {
        type: 'listItem',
        content: [{ type: 'paragraph' }],
      };
    }

    // Check if listItem contains direct inline text or non-block nodes
    const normalizedChildren: RichTextNode[] = [];
    let pendingInline: RichTextNode[] = [];

    const flushPendingInline = () => {
      if (pendingInline.length > 0) {
        normalizedChildren.push({
          type: 'paragraph',
          content: pendingInline,
        });
        pendingInline = [];
      }
    };

    for (const child of rawContent) {
      const normalizedChild = normalizeAstNode(child);
      if (!normalizedChild) continue;

      if (normalizedChild.type === 'text' || normalizedChild.type === 'hardBreak') {
        pendingInline.push(normalizedChild);
      } else {
        flushPendingInline();
        normalizedChildren.push(normalizedChild);
      }
    }

    flushPendingInline();

    return {
      type: 'listItem',
      content: normalizedChildren.length > 0 ? normalizedChildren : [{ type: 'paragraph' }],
      ...(raw.attrs && typeof raw.attrs === 'object' ? { attrs: raw.attrs as Record<string, JSONValue> } : {}),
    };
  }

  // 3. Bullet list and Ordered list - ensure items are listItems
  if (type === 'bulletList' || type === 'orderedList') {
    const rawContent = Array.isArray(raw.content) ? raw.content : [];
    const items: RichTextNode[] = [];

    for (const item of rawContent) {
      const normalizedItem = normalizeAstNode(item);
      if (!normalizedItem) continue;

      if (normalizedItem.type === 'listItem') {
        items.push(normalizedItem);
      } else if (normalizedItem.type === 'paragraph' || normalizedItem.type === 'text') {
        items.push({
          type: 'listItem',
          content: normalizedItem.type === 'paragraph' ? [normalizedItem] : [{ type: 'paragraph', content: [normalizedItem] }],
        });
      }
    }

    return {
      type: type as 'bulletList' | 'orderedList',
      content: items.length > 0 ? items : undefined,
      ...(raw.attrs && typeof raw.attrs === 'object' ? { attrs: raw.attrs as Record<string, JSONValue> } : {}),
    };
  }

  // 4. Blockquote - ensure inline content is wrapped in paragraph if needed
  if (type === 'blockquote') {
    const rawContent = Array.isArray(raw.content) ? raw.content : [];
    const normalizedChildren: RichTextNode[] = [];
    let pendingInline: RichTextNode[] = [];

    const flushPendingInline = () => {
      if (pendingInline.length > 0) {
        normalizedChildren.push({
          type: 'paragraph',
          content: pendingInline,
        });
        pendingInline = [];
      }
    };

    for (const child of rawContent) {
      const normalizedChild = normalizeAstNode(child);
      if (!normalizedChild) continue;

      if (normalizedChild.type === 'text') {
        pendingInline.push(normalizedChild);
      } else {
        flushPendingInline();
        normalizedChildren.push(normalizedChild);
      }
    }

    flushPendingInline();

    return {
      type: 'blockquote',
      content: normalizedChildren.length > 0 ? normalizedChildren : undefined,
    };
  }

  // 5. Generic / standard block nodes (paragraph, heading, codeBlock, horizontalRule, etc.)
  const rawContent = Array.isArray(raw.content) ? raw.content : undefined;
  const content = rawContent
    ? (rawContent.map(normalizeAstNode).filter(Boolean) as RichTextNode[])
    : undefined;

  return {
    type,
    ...(content !== undefined ? { content } : {}),
    ...(typeof raw.text === 'string' ? { text: raw.text } : {}),
    ...(Array.isArray(raw.marks) ? { marks: raw.marks as readonly RichTextMark[] } : {}),
    ...(raw.attrs && typeof raw.attrs === 'object' ? { attrs: raw.attrs as Record<string, JSONValue> } : {}),
  };
}

/**
 * Normalizes a document, string, or undefined input into a guaranteed schema-valid RichTextDocument AST.
 * Handles legacy listItem -> text mappings, unwrapped roots, and missing paragraphs safely without data loss.
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
  if (typeof val !== 'object') {
    return createEmptyRichText();
  }

  const rawDoc = val as unknown as Record<string, unknown>;
  if (rawDoc.type !== 'doc') {
    return createEmptyRichText();
  }

  const rawContent = Array.isArray(rawDoc.content) ? rawDoc.content : [];
  if (rawContent.length === 0) {
    return isRichTextDocument(val) ? val : createEmptyRichText();
  }

  const normalizedContent: RichTextNode[] = [];
  for (const block of rawContent) {
    const normalized = normalizeAstNode(block);
    if (!normalized) continue;

    // Direct text nodes at document root level must be wrapped in a paragraph block
    if (normalized.type === 'text') {
      normalizedContent.push({
        type: 'paragraph',
        content: [normalized],
      });
    } else {
      normalizedContent.push(normalized);
    }
  }

  return {
    type: 'doc',
    content: normalizedContent.length > 0 ? normalizedContent : [{ type: 'paragraph' }],
  };
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
