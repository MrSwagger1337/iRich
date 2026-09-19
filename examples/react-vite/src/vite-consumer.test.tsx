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
import { createEditor, type IRichNode } from '@irich/core';
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

    // Verify draggable attribute on palette items
    paletteItems.forEach((item) => {
      expect(item.getAttribute('draggable')).toBe('true');
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
});

