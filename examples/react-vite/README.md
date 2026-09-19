# iRich React + Vite Example

> Lightweight single-page application (SPA) demonstrating the integration of **iRich** with **Vite 6** and **React 19**, verifying that iRich operates natively with **zero Next.js dependencies**.

---

## 1. Overview

This example demonstrates how an external client-side React application consumes iRich packages directly from a standard Vite workspace.

It uses the same canonical visual editing architecture, drag-and-drop subsystem, RichText editor, and JSON Studio modal established across iRich.

---

## 2. Quick Integration Walkthrough

### Step 1: Install Packages

```bash
pnpm add @irich/core @irich/react @irich/renderer @irich/rich-text @irich/ui
```

### Step 2: Define and Register Components

Declare framework-independent components and register them with `@irich/core`:

```tsx
import { createComponentRegistry, defineComponent } from '@irich/core';

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Feature Card',
  category: 'Marketing',
  fields: {
    title: { type: 'text', label: 'Title', defaultValue: 'Card Title' },
    description: { type: 'textarea', label: 'Description', defaultValue: 'Card text...' },
  },
});

export function createRegistry() {
  const registry = createComponentRegistry();
  registry.register(CardComponent);
  return registry;
}
```

### Step 3: Create Initial Document and Editor

```tsx
import { createDocument, createEditor } from '@irich/core';

const document = createDocument({
  metadata: { title: 'My Document', locale: 'en', direction: 'ltr' },
  root: { id: 'root', type: 'root', children: [] },
});

const editor = createEditor({
  registry: createRegistry(),
  initialDocument: document,
});
```

### Step 4: Visual Editor Studio (`<IRichProvider>` + `<IRichCanvas>`)

```tsx
import {
  IRichProvider,
  IRichCanvas,
  IRichPaletteItem,
  IRichInspector,
  IRichDocumentJsonModal,
} from '@irich/react';

export function EditorApp({ editor }) {
  return (
    <IRichProvider editor={editor}>
      <div className="editor-shell">
        <aside>
          <IRichPaletteItem componentType="Card" label="Feature Card" />
        </aside>

        <main>
          <IRichCanvas components={renderers} />
        </main>

        <aside>
          <IRichInspector />
        </aside>
      </div>
    </IRichProvider>
  );
}
```

### Step 5: Published View (`<IRichRenderer>`)

Rendering the published page requires **zero** editor code, canvas controllers, or DnD mechanics:

```tsx
import { IRichRenderer } from '@irich/renderer';

export function PublishedPage({ document }) {
  return <IRichRenderer document={document} components={renderers} />;
}
```

---

## 3. Cross-Framework Comparison: Next.js vs. React + Vite

| Feature / System | Next.js (`examples/nextjs-basic`) | React + Vite (`examples/react-vite`) | Parity Status |
| :--- | :--- | :--- | :--- |
| **Document State** | Canonical `IRichDocument` JSON | Canonical `IRichDocument` JSON | **Identical** |
| **Component Registry** | `@irich/core` schema registry | `@irich/core` schema registry | **Identical** |
| **Editor Context** | `<IRichProvider editor={editor}>` | `<IRichProvider editor={editor}>` | **Identical** |
| **Visual Canvas** | `<IRichCanvas />` from `@irich/react` | `<IRichCanvas />` from `@irich/react` | **Identical** |
| **Drag and Drop** | Phase 4 canonical DnD engine | Phase 4 canonical DnD engine | **Identical** |
| **RichText Integration**| `IRichTextEditor` + toolbar | `IRichTextEditor` + toolbar | **Identical** |
| **JSON Studio** | `IRichDocumentJsonModal` | `IRichDocumentJsonModal` | **Identical** |
| **RTL / Multilingual** | `useIRichUIDirection()` + Bidi | `useIRichUIDirection()` + Bidi | **Identical** |
| **Published Rendering** | SSR Server Components (`@irich/renderer`) | Client SPA Component (`@irich/renderer`) | **Clean Separation** |
| **Routing / Server** | App Router (`page.tsx`, `layout.tsx`) | Single-page App (`App.tsx`) | **Framework-Specific** |

---

## 4. Project Structure

```
examples/react-vite/
├── src/
│   ├── components/
│   │   ├── definitions.ts              # Component schemas & registry
│   │   ├── renderers.tsx                # Pure presentational component renderers
│   │   ├── sample-document.ts          # English LTR canonical fixture
│   │   └── sample-document-arabic.ts   # Arabic RTL canonical fixture
│   ├── editor/
│   │   ├── EditorStudio.tsx            # 3-pane visual editor shell
│   │   ├── EditorCanvas.tsx            # Visual canvas using canonical IRichCanvas
│   │   ├── EditorToolbar.tsx           # Toolbar with breakpoints, undo/redo, fixture switch
│   │   └── ComponentPalette.tsx        # Palette sidebar using IRichPaletteItem
│   ├── App.tsx                         # Main SPA router switching Published / Editor modes
│   ├── index.css                       # Dark theme & canvas styling
│   ├── main.tsx                        # React 19 entrypoint
│   └── vite-consumer.test.tsx          # Automated verification tests
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 5. Running and Building

```bash
# Start development server
pnpm --filter example-react-vite dev

# Typecheck and production bundle build
pnpm --filter example-react-vite build

# Run consumer tests
pnpm --filter example-react-vite test
```
