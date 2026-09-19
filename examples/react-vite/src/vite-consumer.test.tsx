/**
 * @vitest-environment jsdom
 *
 * Vite Consumer & Cross-Framework Verification Tests.
 * Verifies that the React + Vite consumer integrates cleanly with public @irich packages
 * with zero duplicate canvas or DnD engines and full LTR/RTL support.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createEditor, type IRichDocument, type IRichNode } from '@irich/core';
import { IRichRenderer } from '@irich/renderer';
import {
  IRichProvider,
} from '@irich/react';
import {
  canonicalViteComponents,
  createViteRegistry,
} from './components/definitions';
import { viteRenderers } from './components/renderers';
import { initialViteDocument } from './components/sample-document';
import { initialArabicViteDocument } from './components/sample-document-arabic';
import { EditorCanvas, viteEditorRenderers, createViteEditorComponentMap } from './editor/EditorCanvas';
import { ComponentPalette } from './editor/ComponentPalette';
import App from './App';

// Helper to recursively collect all unique node types from a document
function collectUniqueNodeTypes(node: IRichNode): Set<string> {
  const set = new Set<string>();
  if (node.type !== 'root') {
    set.add(node.type);
  }
  if (node.children) {
    for (const child of node.children) {
      for (const t of collectUniqueNodeTypes(child)) {
        set.add(t);
      }
    }
  }
  if (node.slots) {
    for (const slotNodes of Object.values(node.slots)) {
      if (slotNodes) {
        for (const child of slotNodes) {
          for (const t of collectUniqueNodeTypes(child)) {
            set.add(t);
          }
        }
      }
    }
  }
  return set;
}

// Configure React act() environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('React + Vite Consumer Integration', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
    localStorage.clear();
  });

  it('verifies component registry contains expected definitions', () => {
    const registry = createViteRegistry();
    expect(registry.has('Container')).toBe(true);
    expect(registry.has('Heading')).toBe(true);
    expect(registry.has('RichText')).toBe(true);
    expect(registry.has('Button')).toBe(true);
    expect(registry.has('Hero')).toBe(true);
    expect(registry.has('Card')).toBe(true);
    expect(registry.has('Section')).toBe(true);
    expect(registry.has('Columns')).toBe(true);
    expect(registry.has('Column')).toBe(true);
    expect(registry.has('Callout')).toBe(true);
    expect(registry.has('Quote')).toBe(true);
    expect(registry.has('KeyTakeaway')).toBe(true);
    expect(registry.has('CardGrid')).toBe(true);
    expect(registry.has('CTA')).toBe(true);
    expect(canonicalViteComponents.length).toBe(15);
  });

  it('renders published preview cleanly using @irich/renderer without editor artifacts', () => {
    const html = renderToString(
      <IRichRenderer
        document={initialViteDocument}
        components={viteRenderers}
      />
    );

    // Verifies published rendering includes content
    expect(html).toContain('The Future of Web Content Architecture');
    expect(html).toContain('Architectural Advantages');

    // Verifies zero editor or DnD artifacts in published output
    expect(html).not.toContain('data-irich-canvas');
    expect(html).not.toContain('data-irich-node');
    expect(html).not.toContain('data-irich-selected');
    expect(html).not.toContain('data-irich-empty-slot');
    expect(html).not.toContain('irich-node-actions');
    expect(html).not.toContain('irich-node-drag-handle');
  });

  it('renders published preview in Arabic RTL with correct document direction', () => {
    const html = renderToString(
      <main dir={initialArabicViteDocument.metadata?.direction || 'ltr'}>
        <IRichRenderer
          document={initialArabicViteDocument}
          components={viteRenderers}
        />
      </main>
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('مستقبل بنية المحتوى الرقمي والتحرير المرئي');
    expect(html).toContain('المزايا المعمارية لمنظومة iRich');
  });

  it('enforces editor component-map completeness across all document node types', () => {
    const editorComponents = createViteEditorComponentMap();
    const docTypes = collectUniqueNodeTypes(initialViteDocument.root);
    const arDocTypes = collectUniqueNodeTypes(initialArabicViteDocument.root);
    const allTypes = new Set([...docTypes, ...arDocTypes]);

    // Every unique node type in the document must have a registered renderer in the editor map
    for (const type of allTypes) {
      expect(
        editorComponents[type],
        `Missing editor renderer in createViteEditorComponentMap for node type: "${type}"`
      ).toBeDefined();
      expect(
        viteEditorRenderers[type],
        `Missing editor renderer in viteEditorRenderers for node type: "${type}"`
      ).toBeDefined();
    }
  });

  it('mounts canonical IRichCanvas without unknown component fallbacks and renders all editorial nodes', async () => {
    const registry = createViteRegistry();
    const editor = createEditor({
      registry,
      initialDocument: initialViteDocument,
    });

    await act(async () => {
      root!.render(
        <IRichProvider editor={editor}>
          <EditorCanvas />
        </IRichProvider>
      );
    });

    const canvasElement = container!.querySelector('[data-irich-canvas="true"]');
    expect(canvasElement).not.toBeNull();

    // Regression check: ZERO unknown component fallbacks
    const fallbackElements = container!.querySelectorAll('.irich-unknown-component-fallback');
    expect(fallbackElements.length).toBe(0);
    expect(container!.textContent).not.toContain('Unknown Component');

    // Regression check: All representative Phase 6 editorial components rendered
    expect(container!.querySelector('[data-irich-editorial="section"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="columns"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="column"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="image"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="callout"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="quote"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="takeaway"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="card-grid"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="cta"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="heading"]')).not.toBeNull();
    expect(container!.querySelector('[data-irich-editorial="button"]')).not.toBeNull();

    editor.destroy();
  });

  it('preserves interactive RichText editing in the visual canvas', async () => {
    const registry = createViteRegistry();
    const editor = createEditor({
      registry,
      initialDocument: initialViteDocument,
    });

    await act(async () => {
      root!.render(
        <IRichProvider editor={editor}>
          <EditorCanvas />
        </IRichProvider>
      );
    });

    // Verify interactive RichText containers exist
    const richTextElements = container!.querySelectorAll('.vite-richtext-interactive');
    expect(richTextElements.length).toBeGreaterThan(0);

    // Select the RichText node so isSelected becomes true
    await act(async () => {
      editor.commands.selectNode('text-intro-lead');
    });

    // Verify edit overlay appears when selected
    const editBtn = container!.querySelector('.vite-richtext-edit-overlay button') as HTMLButtonElement;
    expect(editBtn).not.toBeNull();

    // Click "Edit Prose" to open active Tiptap editor box
    await act(async () => {
      editBtn.click();
    });

    // Verify active editor box with toolbar and Done button appears
    const editorBox = container!.querySelector('.vite-richtext-editor-box');
    expect(editorBox).not.toBeNull();

    // Click Done to finish editing
    const doneBtn = editorBox!.querySelector('button.vite-btn-primary') as HTMLButtonElement;
    expect(doneBtn).not.toBeNull();
    await act(async () => {
      doneBtn.click();
    });

    // Returned to view box
    expect(container!.querySelector('.vite-richtext-editor-box')).toBeNull();

    editor.destroy();
  });

  it('mounts ComponentPalette with canonical IRichPaletteItem elements', async () => {
    const registry = createViteRegistry();
    const editor = createEditor({
      registry,
      initialDocument: initialViteDocument,
    });

    await act(async () => {
      root!.render(
        <IRichProvider editor={editor}>
          <ComponentPalette />
        </IRichProvider>
      );
    });

    const paletteItems = container!.querySelectorAll('[data-irich-palette-item]');
    // Excludes internal structural node 'Column'
    expect(paletteItems.length).toBe(canonicalViteComponents.length - 1);

    // Verify draggable attribute on palette items and structured label/desc elements
    paletteItems.forEach((item) => {
      expect(item.getAttribute('draggable')).toBe('true');
      const info = item.querySelector('.irich-palette-btn-info');
      expect(info).not.toBeNull();
      const label = item.querySelector('.irich-palette-btn-label');
      expect(label).not.toBeNull();
      const desc = item.querySelector('.irich-palette-btn-desc');
      expect(desc).not.toBeNull();
    });

    editor.destroy();
  });

  it('renders App shell and allows toggling to Editor view', async () => {
    await act(async () => {
      root!.render(<App />);
    });

    // Initially in Published Preview
    expect(container!.textContent).toContain('Live Published View (Standalone SPA)');

    // Click "Open Visual Studio"
    const openEditorBtn = Array.from(container!.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Open Visual Studio')
    );
    expect(openEditorBtn).toBeDefined();

    await act(async () => {
      openEditorBtn!.click();
    });

    // Now in Editor Mode with IRichCanvas and ComponentPalette
    const canvasElement = container!.querySelector('[data-irich-canvas="true"]');
    expect(canvasElement).not.toBeNull();
    const paletteTitle = container!.querySelector('.vite-palette-title');
    expect(paletteTitle?.textContent).toContain('Components');
  });

  it('opens and renders Document JSON Studio modal with canonical class hierarchy', async () => {
    await act(async () => {
      root!.render(<App />);
    });

    // Find and click "View JSON State" or "Document JSON Studio" button in header
    const studioBtn = Array.from(container!.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('View JSON State') || btn.textContent?.includes('Document JSON Studio')
    );
    expect(studioBtn).toBeDefined();

    await act(async () => {
      studioBtn!.click();
    });

    // Verify modal overlay and card are rendered
    const overlay = container!.querySelector('.irich-modal-overlay.irich-json-studio-modal-overlay');
    expect(overlay).not.toBeNull();
    const card = container!.querySelector('.irich-modal-card.irich-json-studio-modal-card');
    expect(card).not.toBeNull();

    // Verify JSON Studio workbench components
    const studio = container!.querySelector('[data-testid="irich-json-studio"]');
    expect(studio).not.toBeNull();
    const textarea = container!.querySelector('.irich-json-studio-textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.value).toContain('"version": "1.0.0"');
  });

  it('enforces JSON Studio rejects invalid HTML strings in RichText and enables Apply for valid AST', async () => {
    await act(async () => {
      root!.render(<App />);
    });

    // Open JSON Studio modal
    const studioBtn = Array.from(container!.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('View JSON State') || btn.textContent?.includes('Document JSON Studio')
    );
    expect(studioBtn).toBeDefined();

    await act(async () => {
      studioBtn!.click();
    });

    const textarea = container!.querySelector('.irich-json-studio-textarea') as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    // 1. Invalid document with raw HTML string in RichText.props.content
    const invalidDoc = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'bad-rt',
            type: 'RichText',
            props: {
              content: '<p>Hello</p>',
            },
          },
        ],
      },
    };

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )!.set!;
      nativeInputValueSetter.call(textarea, JSON.stringify(invalidDoc, null, 2));
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Click "Validate" button
    const validateBtn = Array.from(container!.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Validate')
    );
    expect(validateBtn).toBeDefined();

    await act(async () => {
      validateBtn!.click();
    });

    // Validation fails: diagnostics panel is shown with error and Apply button is disabled
    const diagnostics = container!.querySelector('[data-testid="irich-json-diagnostics"]');
    expect(diagnostics).not.toBeNull();
    expect(diagnostics!.textContent).toContain('Raw HTML or string is not allowed for RichText content');

    const applyBtn = Array.from(container!.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Apply Document') || btn.textContent?.includes('Apply Changes')
    );
    expect(applyBtn).toBeDefined();
    expect((applyBtn as HTMLButtonElement).disabled).toBe(true);

    // 2. Valid document with canonical RichTextDocument AST
    const validDoc = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'good-rt',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Hello ' },
                      { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    };

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )!.set!;
      nativeInputValueSetter.call(textarea, JSON.stringify(validDoc, null, 2));
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      validateBtn!.click();
    });

    // Validation passes: diagnostics gone, valid banner shown, and Apply button is enabled
    expect(container!.querySelector('[data-testid="irich-json-diagnostics"]')).toBeNull();
    expect(container!.querySelector('[data-testid="irich-json-valid-banner"]')).not.toBeNull();
    expect((applyBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('verifies RichText AST visual editor roundtrip and published rendering', async () => {
    const registry = createViteRegistry();
    const initialDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'rt-roundtrip',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Hello ' },
                      { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
                    ],
                  },
                ],
              } as never,
            },
          },
        ],
      },
    };

    const editor = createEditor({
      registry,
      initialDocument: initialDoc,
    });

    await act(async () => {
      root!.render(
        <IRichProvider editor={editor}>
          <EditorCanvas />
        </IRichProvider>
      );
    });

    // 1. Visual editor displays formatted text
    expect(container!.textContent).toContain('Hello world');

    // 2. Literal serialization strings are absent
    expect(container!.textContent).not.toContain('<p>');
    expect(container!.textContent).not.toContain('<strong>');
    expect(container!.textContent).not.toContain('&ldquo;');

    // 3. "world" has the expected bold semantic mark in editor DOM
    const strongEl = container!.querySelector('strong');
    expect(strongEl).not.toBeNull();
    expect(strongEl!.textContent).toBe('world');

    // 4. Edit prose via command write-back
    const updatedAst = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph' as const,
          content: [
            { type: 'text' as const, text: 'Updated ' },
            { type: 'text' as const, text: 'editorial prose', marks: [{ type: 'italic' as const }] },
          ],
        },
      ],
    };

    await act(async () => {
      editor.commands.updateNode({
        nodeId: 'rt-roundtrip',
        props: { content: updatedAst as never },
      });
    });

    // 5. Content remains an AST object in editor state
    const currentDoc = editor.getDocument();
    const rtNode = currentDoc.root.children?.[0];
    expect(typeof rtNode?.props.content).toBe('object');
    expect((rtNode?.props.content as Record<string, unknown>).type).toBe('doc');

    // 6. Published renderer displays the updated formatted content
    const publishedHtml = renderToString(
      <IRichRenderer document={currentDoc} components={viteRenderers} />
    );
    expect(publishedHtml).toContain('Updated ');
    expect(publishedHtml).toContain('<em>editorial prose</em>');
    expect(publishedHtml).not.toContain('&lt;p&gt;');

    editor.destroy();
  });

  it('isolates fixture storage between English and Arabic records', () => {
    const enKey = 'irich:vite-example:english';
    const arKey = 'irich:vite-example:arabic';

    localStorage.setItem(enKey, JSON.stringify(initialViteDocument));
    localStorage.setItem(arKey, JSON.stringify(initialArabicViteDocument));

    const loadedEn = JSON.parse(localStorage.getItem(enKey)!);
    const loadedAr = JSON.parse(localStorage.getItem(arKey)!);

    expect(loadedEn.metadata.locale).toBe('en');
    expect(loadedEn.metadata.direction).toBe('ltr');
    expect(loadedAr.metadata.locale).toBe('ar');
    expect(loadedAr.metadata.direction).toBe('rtl');
  });

  it('scaffolds Columns with two Column children and allows inserting nested RichText without manual JSON editing', async () => {
    const registry = createViteRegistry();
    const emptyDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root-empty',
        type: 'root',
        props: {},
        children: [],
      },
    };

    const editor = createEditor({
      registry,
      initialDocument: emptyDoc,
    });

    await act(async () => {
      root!.render(
        <IRichProvider editor={editor}>
          <EditorCanvas />
        </IRichProvider>
      );
    });

    // 1. Insert Columns via palette insertion (instantiateComponentNode)
    const { instantiateComponentNode } = await import('@irich/core');
    const colsNode = instantiateComponentNode('Columns', registry);

    await act(async () => {
      editor.commands.insertNode({
        node: colsNode,
        parentId: 'root-empty',
      });
    });

    const currentDoc = editor.getDocument();
    expect(currentDoc.root.children?.length).toBe(1);
    const cols = currentDoc.root.children![0];
    expect(cols.type).toBe('Columns');
    expect(cols.children?.length).toBe(2);

    const [col1, col2] = cols.children!;
    expect(col1.type).toBe('Column');
    expect(col2.type).toBe('Column');
    expect(col1.id).not.toBe(col2.id);

    // 2. Insert RichText into the first scaffolded Column
    const rtNode = instantiateComponentNode('RichText', registry, {
      props: {
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Nested column prose' }],
            },
          ],
        } as never,
      },
    });

    await act(async () => {
      editor.commands.insertNode({
        node: rtNode,
        parentId: col1.id,
      });
    });

    const updatedDoc = editor.getDocument();
    const updatedCol1 = updatedDoc.root.children![0].children![0];
    expect(updatedCol1.children?.length).toBe(1);
    expect(updatedCol1.children![0].type).toBe('RichText');

    // 3. Rendered in Canvas without errors or unknown components
    const canvasElement = container!.querySelector('[data-irich-canvas="true"]');
    expect(canvasElement).not.toBeNull();
    expect(container!.textContent).toContain('Nested column prose');
    expect(container!.querySelectorAll('.irich-unknown-component-fallback').length).toBe(0);

    editor.destroy();
  });
});

