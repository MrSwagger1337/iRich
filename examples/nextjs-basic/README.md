# iRich Next.js Basic Example

A complete, production-ready demonstration of integrating **iRich** into an external Next.js application.

This example illustrates the clean architectural separation between:
1. **Production Rendering** (`@irich/renderer`): Lightweight, SSR-compatible rendering of canonical JSON documents without loading visual editor dependencies.
2. **Visual Authoring & Inspection** (`@irich/react`): Dynamic property controls, component palette, responsive breakpoint viewports, keyboard shortcuts, and autosave.
3. **Core Engine & Schemas** (`@irich/core`): Pure framework-independent component definitions, strict JSON document state, placement rules, and AI sandboxing.

---

## Architecture Overview

```
examples/nextjs-basic/
├── app/
│   ├── components/
│   │   ├── definitions.ts      # Component schemas (Hero, Features, FeatureCard, CTA, etc.)
│   │   ├── renderers.tsx        # React renderers for @irich/renderer
│   │   └── sample-document.ts  # Canonical sample JSON document
│   ├── editor/
│   │   └── page.tsx            # Full visual editor studio shell (@irich/react)
│   ├── globals.css             # Dark-mode first design system
│   ├── layout.tsx              # Root Next.js layout
│   └── page.tsx                # Live Published View (SSR with @irich/renderer)
├── package.json
└── README.md
```

---

## 8 Sample Components Included

| Component | Category | Purpose |
| :--- | :--- | :--- |
| **`Hero`** | Marketing | High-impact landing banner with eyebrow badge, title, subtitle, and dual CTA buttons. |
| **`Features`** | Marketing | Responsive multi-column container for grouping feature highlights. |
| **`FeatureCard`** | Marketing | Interactive card with icon badge, title, description, and accent color. |
| **`CTA`** | Marketing | High-conversion callout section with radiant gradient mesh. |
| **`Heading`** | Typography | Structured headings (`h1`–`h4`) with alignment and color variants. |
| **`RichText`** | Typography | Multi-line formatted text integrating `@irich/rich-text`. |
| **`Button`** | Interactive | Call-to-action button or link with size and style variants. |
| **`Container`** | Layout | Section wrapper with responsive padding, max-width, and layout direction. |

---

## Step-by-Step Integration Guide

### 1. Define Components (`@irich/core`)

Components are declared using `defineComponent` with strongly typed prop field schemas:

```typescript
// app/components/definitions.ts
import { defineComponent } from '@irich/core';

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Card',
  category: 'Marketing',
  fields: {
    title: { type: 'text', label: 'Title', defaultValue: 'Highlight' },
    description: { type: 'textarea', label: 'Description' },
    tag: { type: 'text', label: 'Badge Tag' },
  },
});
```

### 2. Create React Renderers (`@irich/renderer`)

Create lightweight React components that accept `{ node, children, breakpoint }`:

```typescript
// app/components/renderers.tsx
import type { ComponentRenderer, ComponentRenderProps } from '@irich/renderer';

export const CardRenderer: ComponentRenderer = ({ node, children }: ComponentRenderProps) => {
  return (
    <div className="card">
      <span className="badge">{node.props.tag as string}</span>
      <h3>{node.props.title as string}</h3>
      <p>{node.props.description as string}</p>
      {children}
    </div>
  );
};
```

### 3. Register Components (`@irich/core`)

Assemble components into a `ComponentRegistry`:

```typescript
import { createComponentRegistry } from '@irich/core';
import { CardComponent, HeroComponent } from './definitions';

export function createRegistry() {
  const registry = createComponentRegistry();
  registry.register(HeroComponent);
  registry.register(CardComponent);
  return registry;
}
```

### 4. Render Saved Documents Outside the Editor (`@irich/renderer`)

Render canonical JSON documents on published pages with zero editor overhead:

```typescript
// app/page.tsx
import { IRichRenderer } from '@irich/renderer';
import { nextjsRenderers } from './components/renderers';

export default function PublishedPage({ document }: { document: IRichDocument }) {
  return (
    <main>
      <IRichRenderer
        document={document}
        components={nextjsRenderers}
      />
    </main>
  );
}
```

### 5. Embed the Visual Editor (`@irich/react`)

Embed the interactive visual editor and dynamic property inspector:

```typescript
// app/editor/page.tsx
'use client';

import { createEditor } from '@irich/core';
import { IRichProvider, IRichInspector, useIRichEditor } from '@irich/react';
import { createRegistry } from '../components/definitions';

export default function EditorPage() {
  const editor = useMemo(() => createEditor({
    registry: createRegistry(),
    initialDocument: initialDoc,
  }), []);

  return (
    <IRichProvider editor={editor}>
      <div className="editor-shell">
        <CanvasArea />
        <IRichInspector />
      </div>
    </IRichProvider>
  );
}
```

---

## Running the Example Locally

From the workspace root:

```bash
# Start development server on port 3002
pnpm --filter example-nextjs-basic dev

# Build production bundle
pnpm --filter example-nextjs-basic build

# Start production server
pnpm --filter example-nextjs-basic start
```

Open [http://localhost:3002](http://localhost:3002) in your browser:
- Navigate to `/` to view the **Live Published SSR View**.
- Click **"Open Visual Editor"** (`/editor`) to launch the interactive studio.
