import { describe, expect, it } from 'vitest';
import {
  createDocument,
  createEditor,
  createNode,
  createComponentRegistry,
  defineComponent,
  formatDocumentJSON,
  validateDocumentJSON,
  type IRichDocument,
} from '@irich/core';

describe('Document Import & External Restructuring Round-trip Fixture Test', () => {
  const registry = createComponentRegistry();

  registry.register(
    defineComponent({
      type: 'Hero',
      label: 'Hero',
      fields: { title: { type: 'text', defaultValue: 'Hero Title' } },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Container',
      label: 'Container',
      fields: { maxWidth: { type: 'text', defaultValue: '1200px' } },
      allowedChildren: ['Heading', 'Paragraph', 'Card', 'Button'],
    }),
  );
  registry.register(
    defineComponent({
      type: 'Heading',
      label: 'Heading',
      fields: { text: { type: 'text', defaultValue: 'Heading' } },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Paragraph',
      label: 'Paragraph',
      fields: { content: { type: 'text', defaultValue: '' } },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Card',
      label: 'Card',
      fields: {
        title: { type: 'text', defaultValue: 'Card Title' },
        description: { type: 'textarea', defaultValue: 'Card description' },
      },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Button',
      label: 'Button',
      fields: { label: { type: 'text', defaultValue: 'Click Me' } },
    }),
  );

  it('executes full round-trip workflow: Format A -> External Redesign B -> Validate -> Apply -> Undo -> Redo', () => {
    // 1. Initial Author Document A (Simple linear layout)
    const docA: IRichDocument = createDocument({
      metadata: {
        title: 'Initial Article',
        locale: 'en',
        direction: 'ltr',
      },
      root: {
        children: [
          createNode({
            type: 'Heading',
            id: 'heading-1',
            props: { text: 'Traditional Editorial Article' },
          }),
          createNode({
            type: 'Paragraph',
            id: 'paragraph-1',
            props: { content: 'Initial paragraph content explaining the topic.' },
          }),
          createNode({
            type: 'Paragraph',
            id: 'paragraph-2',
            props: { content: 'Second paragraph with concluding remarks.' },
          }),
        ],
      },
    });

    const editor = createEditor({
      initialDocument: docA,
      registry,
    });

    // 2. Export & Format Document A for External AI Assistant
    const exportedA = formatDocumentJSON(editor.getDocument(), { indent: 2 });
    expect(exportedA).toContain('Traditional Editorial Article');
    expect(exportedA).toContain('heading-1');

    // 3. External AI Restructuring Output (Document B with richer nested visual composition)
    const docBJson = JSON.stringify({
      version: '1.0.0',
      metadata: {
        title: 'Redesigned Editorial Experience',
        locale: 'en',
        direction: 'ltr',
      },
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'container-main',
            type: 'Container',
            props: { maxWidth: '1200px' },
            children: [
              {
                id: 'heading-redesign',
                type: 'Heading',
                props: { text: 'AI Restructured Interactive Article' },
              },
              {
                id: 'paragraph-intro',
                type: 'Paragraph',
                props: { content: 'Redesigned with rich component containers and cards.' },
              },
              {
                id: 'card-feature',
                type: 'Card',
                props: {
                  title: 'Visual Page Composition',
                  description: 'Modular sections with interactive preview.',
                },
              },
              {
                id: 'btn-cta',
                type: 'Button',
                props: { label: 'Explore Features' },
              },
            ],
          },
        ],
      },
    });

    // 4. Validate External AI Response
    const validationResult = validateDocumentJSON(docBJson, { registry });
    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors.length).toBe(0);

    // 5. Apply Document B Atomically
    const parsedDocB = JSON.parse(docBJson) as IRichDocument;
    editor.commands.replaceDocument(parsedDocB);

    // Verify canvas / editor state matches Document B
    const currentDoc = editor.getDocument();
    expect(currentDoc.metadata?.title).toBe('Redesigned Editorial Experience');
    expect(currentDoc.root.children?.length).toBe(1);
    expect(currentDoc.root.children?.[0]?.type).toBe('Container');
    expect(currentDoc.root.children?.[0]?.children?.length).toBe(4);

    // 6. Undo restores Document A in exactly 1 step
    const undoSuccess = editor.commands.undo();
    expect(undoSuccess).toBe(true);
    expect(editor.getDocument().metadata?.title).toBe('Initial Article');
    expect(editor.getDocument().root.children?.length).toBe(3);
    expect(editor.getDocument().root.children?.[0]?.id).toBe('heading-1');

    // 7. Redo restores Document B
    const redoSuccess = editor.commands.redo();
    expect(redoSuccess).toBe(true);
    expect(editor.getDocument().metadata?.title).toBe('Redesigned Editorial Experience');
    expect(editor.getDocument().root.children?.[0]?.id).toBe('container-main');

    editor.destroy();
  });

  it('rejects invalid external AI JSON with unknown components, leaving original document intact', () => {
    const docA = createDocument({
      metadata: { title: 'Safe Document' },
      root: {
        children: [createNode({ type: 'Heading', id: 'h-1', props: { text: 'Safe Heading' } })],
      },
    });

    const editor = createEditor({
      initialDocument: docA,
      registry,
    });

    // External AI returned an unregistered hallucinated component
    const badAiJson = JSON.stringify({
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'hallucinated-1',
            type: 'UnregisteredSuperGrid',
            props: { columns: 5 },
          },
        ],
      },
    });

    const validation = validateDocumentJSON(badAiJson, { registry });
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.details[0].code).toBe('UNKNOWN_COMPONENT');
    expect(validation.details[0].nodeType).toBe('UnregisteredSuperGrid');

    // Original document is completely untouched
    expect(editor.getDocument().metadata?.title).toBe('Safe Document');
    expect(editor.getDocument().root.children?.[0]?.id).toBe('h-1');

    editor.destroy();
  });
});
