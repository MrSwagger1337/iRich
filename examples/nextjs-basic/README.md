# iRich Next.js Reference Example

A reference implementation demonstrating how to integrate **iRich** into a Next.js App Router application.

This example illustrates the architectural separation between:
1. **Server-Side Production Rendering** (`@irich/renderer`): Lightweight React Server Component (RSC) rendering of canonical JSON documents with zero visual editor dependencies in the client bundle.
2. **Client-Side Visual Authoring** (`@irich/react`): Dynamic property inspection, component palette, responsive viewport previews, node management, and local draft autosave.
3. **Core Engine & Schemas** (`@irich/core`): Pure framework-independent component definitions, strict JSON document models, and command pipeline.

---

## Architecture & File Map

```
examples/nextjs-basic/
├── app/
│   ├── components/
│   │   ├── definitions.ts      # 6 canonical component schemas (Hero, Heading, RichText, Container, Card, Button)
│   │   ├── renderers.tsx       # Clean React renderers for @irich/renderer
│   │   └── sample-document.ts  # Canonical sample JSON document
│   ├── editor/
│   │   └── page.tsx            # Client entry point ('use client') mounting <IRichProvider> & <EditorStudio>
│   ├── globals.css             # Restrained design tokens & editor styling
│   ├── layout.tsx              # Root Next.js layout
│   └── page.tsx                # Genuine React Server Component (RSC) rendering canonical JSON
├── editor/
│   ├── ComponentPalette.tsx    # Left sidebar: Categorized component list
│   ├── EditorCanvas.tsx        # Center canvas: Responsive frame with @irich/renderer & selection wrappers
│   ├── EditorStudio.tsx        # 3-pane layout shell (palette, canvas, inspector)
│   ├── EditorToolbar.tsx       # Top bar: Undo/Redo, Autosave status, Viewport switcher
│   ├── JsonModal.tsx           # Accessible modal for inspecting canonical document JSON
│   └── NodeActions.tsx         # Floating action toolbar (Move Up, Move Down, Duplicate, Delete)
├── package.json
└── README.md
```

---

## 6 Canonical Demonstration Components

| Component | Category | Purpose & Capabilities |
| :--- | :--- | :--- |
| **`Hero`** | Marketing | Landing banner with eyebrow badge, headline, subtitle, primary CTA, secondary CTA, and alignment toggle. |
| **`Heading`** | Typography | Structured headings (`h1`–`h4`) with alignment and color styles (`default`, `muted`, `gradient`). |
| **`RichText`** | Typography | Multi-line prose with in-place rich text editing powered by `@irich/rich-text`. |
| **`Container`** | Layout | Section wrapper with max-width constraint, responsive padding, and background surface options. |
| **`Card`** | Marketing | Feature card with category badge, title, description, variant style, and optional button link. |
| **`Button`** | Interactive | Call-to-action button or link with size and variant styling. |

---

## Step-by-Step Integration Guide

### 1. Define Component Schemas (`@irich/core`)

Declare components using `defineComponent` with strongly typed prop field descriptors:

```typescript
// app/components/definitions.ts
import { defineComponent } from '@irich/core';

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Card',
  category: 'Marketing',
  fields: {
    tag: { type: 'text', label: 'Badge Tag', defaultValue: 'Feature' },
    title: { type: 'text', label: 'Title', defaultValue: 'Card Title' },
    description: { type: 'textarea', label: 'Description' },
    variant: {
      type: 'select',
      label: 'Variant',
      defaultValue: 'default',
      options: [
        { label: 'Default Surface', value: 'default' },
        { label: 'Highlighted Glow', value: 'highlight' },
      ],
    },
  },
});
```

### 2. Create React Renderers (`@irich/renderer`)

Create lightweight React components that accept resolved props and optional children:

```typescript
// app/components/renderers.tsx
import type { ComponentRenderer, NodeRendererProps } from '@irich/renderer';

export const CardRenderer: ComponentRenderer<{
  tag?: string;
  title?: string;
  description?: string;
  variant?: string;
}> = ({ tag, title, description, variant }) => {
  return (
    <div className={`card card-${variant}`}>
      {tag && <span className="badge">{tag}</span>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### 3. Server Component Production Rendering (`app/page.tsx`)

Render canonical JSON documents directly on the server in a React Server Component with zero visual editor overhead:

```tsx
// app/page.tsx (Server Component)
import { IRichRenderer } from '@irich/renderer';
import { nextjsRenderers } from './components/renderers';
import { initialNextjsDocument } from './components/sample-document';

export default function PublishedPage() {
  return (
    <main>
      <IRichRenderer
        document={initialNextjsDocument}
        components={nextjsRenderers}
      />
    </main>
  );
}
```

### 4. Client-Side Visual Editor (`app/editor/page.tsx`)

Embed the visual editor inside a `"use client"` route:

```tsx
// app/editor/page.tsx
'use client';

import { useMemo } from 'react';
import { createEditor } from '@irich/core';
import { IRichProvider } from '@irich/react';
import { createNextjsRegistry } from '../components/definitions';
import { initialNextjsDocument } from '../components/sample-document';
import { EditorStudio } from '../../editor/EditorStudio';

export default function EditorPage() {
  const editor = useMemo(() => createEditor({
    registry: createNextjsRegistry(),
    initialDocument: initialNextjsDocument,
  }), []);

  return (
    <IRichProvider editor={editor}>
      <EditorStudio />
    </IRichProvider>
  );
}
```

---

## Persistence: Editor Draft vs. Server Rendered

- **Published Server Page (`/`)**: Renders canonical JSON on the server via `IRichRenderer`. In a production app, this JSON would be fetched from your database or CMS API.
- **Visual Editor Studio (`/editor`)**: Uses `LocalStorageAdapter` and `useIRichAutosave` to save a local client draft as you edit. Click **JSON State** in the editor toolbar to copy the updated canonical document JSON for your database.

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
- Click **"Open Visual Editor"** (`/editor`) to launch the visual studio.
