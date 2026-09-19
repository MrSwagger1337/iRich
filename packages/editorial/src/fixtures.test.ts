import { describe, it, expect } from 'vitest';
import {
  createEditor,
  validateDocument,
} from '@irich/core';
import { createEditorialRegistry } from './definitions';
import {
  flatArticleDocument,
  redesignedEditorialDocument,
  arabicEditorialDocument,
} from './fixtures/article-redesign';

describe('@irich/editorial Deterministic Redesign Fixtures & Roundtrip', () => {
  const registry = createEditorialRegistry();

  it('validates flat article fixture (Doc A) cleanly against registry', () => {
    const result = validateDocument(flatArticleDocument, { registry });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates redesigned editorial fixture (Doc B) cleanly against registry', () => {
    const result = validateDocument(redesignedEditorialDocument, { registry });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates Arabic editorial fixture cleanly against registry with RTL metadata', () => {
    const result = validateDocument(arabicEditorialDocument, { registry });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('performs deterministic external AI replacement roundtrip: A -> B -> Undo (A) -> Redo (B)', () => {
    const editor = createEditor({
      initialDocument: flatArticleDocument,
      registry,
    });

    const initialChildren = editor.getDocument().root.children;
    expect(initialChildren).toBeDefined();
    expect(initialChildren?.[0]?.props.text).toBe(
      'The Future of Web Content Architecture',
    );
    expect(initialChildren?.length).toBe(7);

    // 1. Replace with externally redesigned editorial document (B)
    editor.commands.replaceDocument(redesignedEditorialDocument);

    const stateB = editor.getDocument();
    const childrenB = stateB.root.children;
    expect(childrenB).toBeDefined();
    expect(childrenB?.length).toBe(5);
    expect(childrenB?.[0]?.type).toBe('Section');
    expect(childrenB?.[1]?.type).toBe('Quote');
    expect(childrenB?.[2]?.type).toBe('KeyTakeaway');
    expect(childrenB?.[3]?.type).toBe('Section');
    expect(childrenB?.[4]?.type).toBe('CTA');

    // 2. Undo returns cleanly to flat document (A)
    editor.commands.undo();

    const stateA = editor.getDocument();
    const childrenA = stateA.root.children;
    expect(childrenA).toBeDefined();
    expect(childrenA?.length).toBe(7);
    expect(childrenA?.[0]?.type).toBe('Heading');
    expect(childrenA?.[1]?.type).toBe('RichText');
    expect(childrenA?.[2]?.type).toBe('Image');

    // 3. Redo returns cleanly to redesigned editorial document (B)
    editor.commands.redo();

    const stateB2 = editor.getDocument();
    const childrenB2 = stateB2.root.children;
    expect(childrenB2).toBeDefined();
    expect(childrenB2?.length).toBe(5);
    expect(childrenB2?.[0]?.type).toBe('Section');
  });
});
