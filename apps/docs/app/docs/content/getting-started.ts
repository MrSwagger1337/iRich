import type { DocPage } from '../types';

export const gettingStartedPages: DocPage[] = [
  {
    slug: 'introduction',
    category: 'getting-started',
    categoryTitle: 'Getting Started',
    title: 'Introduction to iRich',
    description: 'An embeddable, extensible visual content editor and page builder for React.',
    badge: 'Core',
    sections: [
      { id: 'what-is-irich', title: 'What is iRich?' },
      { id: 'core-philosophy', title: 'Core Philosophy' },
      { id: 'package-architecture', title: 'Package Architecture' },
      { id: 'key-features', title: 'Key Features' },
    ],
    content: `
## What is iRich?

**iRich** is a framework-independent, embeddable visual content editor and modular page builder designed for React applications. It bridges the gap between structured rich-text authoring and modular component-based page composition.

Whether you are building a custom CMS, a marketing landing page editor, or an in-app visual workspace, iRich gives you fine-grained control over document state, responsive layouts, property inspection, and production rendering.

\`\`\`
+-------------------------------------------------------------+
|                      iRich Architecture                     |
+-------------------------------------------------------------+
|  Visual Studio  |  Rich Text   |  Plugins  |  UI Primitives |
|  (@irich/react) | (@irich/rt)  | (@irich/p)|  (@irich/ui)   |
+-------------------------------------------------------------+
|                     Document Engine                         |
|                      (@irich/core)                          |
+-------------------------------------------------------------+
|                        Renderer                             |
|                   (@irich/renderer)                         |
+-------------------------------------------------------------+
\`\`\`

---

## Core Philosophy

iRich is built around architectural principles that ensure speed, maintainability, and clean boundaries:

1. **Framework-Independent Core (\`@irich/core\`)**: The core document engine, state machine, and command transaction pipeline have **zero dependencies on React, DOM, or Next.js**. It runs natively in Node.js, Web Workers, and Edge runtimes.
2. **Deterministic JSON Serialization**: The entire document state is strictly serializable to plain JSON. No JSX, DOM nodes, functions, or class instances are stored in state.
3. **Renderer / Editor Decoupling**: Published pages load only the lightweight (\`< 15kB\`) \`@irich/renderer\`. The visual editor, canvas controllers, and property sidebars are never bundled into production views.
4. **Command-Based State Mutations**: All changes flow through structured commands (\`insertNode\`, \`updateNode\`, \`moveNode\`, \`duplicateNode\`, \`batch\`) that participate in atomic undo/redo history.
5. **First-Class Responsive Values**: Breakpoint overrides (\`desktop\`, \`tablet\`, \`mobile\`) are stored natively within property values without tree duplication.

---

## Package Architecture

| Package | Role | Framework Dependencies |
| :--- | :--- | :--- |
| **\`@irich/core\`** | Document model, command pipeline, component registry, history, validation | Pure TypeScript (Zero dependencies) |
| **\`@irich/renderer\`** | High-performance SSR-compatible component tree renderer | React / SSR compatible |
| **\`@irich/react\`** | Visual editor provider, interactive canvas, hooks, inspector, autosave | React 19 / 18 |
| **\`@irich/rich-text\`** | Headless rich-text models, marks, and inline Tiptap integration | Pure TS + React renderer |
| **\`@irich/plugin-sdk\`** | Plugin contracts, middleware pipeline, and lifecycle extension hooks | Pure TypeScript |
| **\`@irich/ui\`** | Accessible, themeable UI components for sidebars and toolbars | React |

---

## Key Features

- ⚡ **Lightning Fast**: Fine-grained subscriptions with \`useSyncExternalStore\` prevent full-tree re-renders on prop updates.
- 📱 **Responsive Viewports**: Seamless switching between Desktop, Tablet, and Mobile editing modes with non-destructive fallback resolution.
- 🎨 **Schema-Driven Inspector**: Automatically generated inspector controls (\`text\`, \`textarea\`, \`number\`, \`boolean\`, \`select\`, \`color\`) based on registered component definitions.
- 💾 **Pluggable Persistence**: Built-in \`LocalStorageAdapter\`, \`MemoryStorageAdapter\`, and debounced \`useIRichAutosave()\`.
- ⌨️ **Productivity Shortcuts**: Full keyboard shortcut support for Undo/Redo, Copy, Cut, Paste, Duplicate, and Delete.
`,
  },
  {
    slug: 'installation',
    category: 'getting-started',
    categoryTitle: 'Getting Started',
    title: 'Installation & Setup',
    description: 'How to install and configure iRich packages in your project.',
    badge: 'Stable',
    sections: [
      { id: 'package-managers', title: 'Package Managers' },
      { id: 'package-selection', title: 'Selecting Packages' },
      { id: 'peer-dependencies', title: 'Peer Dependencies' },
      { id: 'typescript-configuration', title: 'TypeScript Configuration' },
    ],
    content: `
## Package Managers

Install the required iRich packages using your preferred package manager:

\`\`\`bash
# Using pnpm (recommended)
pnpm add @irich/core @irich/react @irich/renderer @irich/rich-text

# Using npm
npm install @irich/core @irich/react @irich/renderer @irich/rich-text

# Using yarn
yarn add @irich/core @irich/react @irich/renderer @irich/rich-text
\`\`\`

---

## Selecting Packages

Depending on your application use case, you only need to install what you use:

### For Published Pages (Rendering Only)
If you only need to render saved iRich documents on a public website without visual editing:

\`\`\`bash
pnpm add @irich/core @irich/renderer
\`\`\`

### For Visual Studio / CMS Applications
If you are building an interactive visual editor:

\`\`\`bash
pnpm add @irich/core @irich/react @irich/renderer @irich/rich-text @irich/plugin-sdk
\`\`\`

---

## Peer Dependencies

iRich React bindings are built for modern React:

- **React**: \`^18.2.0\` or \`^19.0.0\`
- **React DOM**: \`^18.2.0\` or \`^19.0.0\`

\`\`\`json
{
  "peerDependencies": {
    "react": ">=18.2.0",
    "react-dom": ">=18.2.0"
  }
}
\`\`\`

---

## TypeScript Configuration

iRich is written in strict TypeScript. We recommend enabling \`strict\` mode in your \`tsconfig.json\`:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  }
}
\`\`\`
`,
  },
  {
    slug: 'quick-start',
    category: 'getting-started',
    categoryTitle: 'Getting Started',
    title: 'Quick Start (5-Minute Guide)',
    description: 'Learn the essentials: define a component, mount the visual editor, and render published content.',
    badge: 'Stable',
    sections: [
      { id: 'step-1-define-component', title: '1. Define a Component Schema' },
      { id: 'step-2-create-renderer', title: '2. Create a React Renderer' },
      { id: 'step-3-mount-editor', title: '3. Mount the Visual Editor' },
      { id: 'step-4-render-published', title: '4. Render Published Content' },
    ],
    content: `
## 1. Define a Component Schema

In iRich, components are defined declaratively with typed field descriptors using \`defineComponent\`:

\`\`\`typescript
// components/Hero.ts
import { defineComponent } from '@irich/core';

export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  category: 'Marketing',
  fields: {
    title: {
      type: 'text',
      label: 'Headline Title',
      defaultValue: 'Build Visual Experiences Faster',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle',
      defaultValue: 'iRich combines visual page building with structured rich-text.',
    },
    showBadge: {
      type: 'boolean',
      label: 'Show Badge',
      defaultValue: true,
    },
  },
});
\`\`\`

---

## 2. Create a React Renderer

Define the corresponding React component that renders the node props:

\`\`\`tsx
// components/HeroRenderer.tsx
import type { NodeRendererProps } from '@irich/renderer';

export function HeroRenderer({
  node,
  title = node.props.title as string,
  subtitle = node.props.subtitle as string,
  showBadge = node.props.showBadge as boolean,
}: NodeRendererProps<{ title?: string; subtitle?: string; showBadge?: boolean }>) {
  return (
    <section style={{ padding: '4rem 2rem', textAlign: 'center', background: '#0f172a', color: '#fff' }}>
      {showBadge && <span style={{ background: '#6366f1', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem' }}>New</span>}
      <h1 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{title}</h1>
      <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '1rem auto' }}>{subtitle}</p>
    </section>
  );
}
\`\`\`

---

## 3. Mount the Visual Editor

Create the editor instance, register your component definition, and wrap your visual studio in \`<IRichProvider>\`:

\`\`\`tsx
// EditorPage.tsx
import { useState, useMemo } from 'react';
import { createEditor, createComponentRegistry, createDocument, createNode } from '@irich/core';
import { IRichProvider, IRichInspector, useIRichEditor, useIRichDocument, useIRichSelection } from '@irich/react';
import { HeroComponent } from './components/Hero';
import { HeroRenderer } from './components/HeroRenderer';

export function VisualStudio() {
  const editor = useMemo(() => {
    const registry = createComponentRegistry();
    registry.register(HeroComponent);

    return createEditor({
      registry,
      initialDocument: createDocument({
        root: {
          id: 'root',
          type: 'root',
          children: [
            createNode({
              type: 'Hero',
              props: { title: 'Welcome to iRich!' },
            }),
          ],
        },
      }),
    });
  }, []);

  return (
    <IRichProvider editor={editor}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Visual Canvas */}
        <main style={{ flex: 1, padding: '2rem', background: '#090d16' }}>
          <CanvasView />
        </main>

        {/* Dynamic Property Inspector */}
        <aside style={{ width: '320px', borderLeft: '1px solid #1e293b', background: '#0f172a' }}>
          <IRichInspector />
        </aside>
      </div>
    </IRichProvider>
  );
}

function CanvasView() {
  const document = useIRichDocument();
  const { selectedNodeId, selectNode } = useIRichSelection();

  return (
    <div>
      {document.root.children?.map((node) => (
        <div
          key={node.id}
          onClick={() => selectNode(node.id)}
          style={{
            outline: selectedNodeId === node.id ? '2px solid #6366f1' : '1px dashed transparent',
            cursor: 'pointer',
            margin: '1rem 0',
          }}
        >
          <HeroRenderer node={node} />
        </div>
      ))}
    </div>
  );
}
\`\`\`

---

## 4. Render Published Content

On published pages, use standalone \`<IRichRenderer />\` for maximum performance:

\`\`\`tsx
// PublishedPage.tsx
import { IRichRenderer } from '@irich/renderer';
import { HeroRenderer } from './components/HeroRenderer';

const renderers = {
  Hero: HeroRenderer,
};

export function PublishedView({ document }: { document: any }) {
  return <IRichRenderer document={document} components={renderers} />;
}
\`\`\`
`,
  },
  {
    slug: 'nextjs',
    category: 'getting-started',
    categoryTitle: 'Getting Started',
    title: 'Next.js Integration Guide',
    description: 'Best practices for using iRich in Next.js App Router and Server-Side Rendering (SSR).',
    badge: 'SSR',
    sections: [
      { id: 'nextjs-architecture', title: 'Next.js Architectural Model' },
      { id: 'ssr-published-rendering', title: 'SSR Published Page (Server Component)' },
      { id: 'visual-editor-client', title: 'Visual Editor (Client Component)' },
      { id: 'hydration-best-practices', title: 'Hydration Best Practices' },
    ],
    content: `
## Next.js Architectural Model

iRich is built from the ground up to support Next.js App Router and React Server Components (RSC):

- **Production Rendering (\`@irich/renderer\`)**: Fully SSR and RSC compatible. Executes on the server without accessing \`window\`, \`document\`, or browser APIs.
- **Visual Studio Editor (\`@irich/react\`)**: Interactive client-side workspace requiring \`'use client'\` directive for DOM measurements, selection pointer events, and drag-and-drop orchestration.

---

## SSR Published Page (Server Component)

On public-facing pages, render saved iRich documents directly inside a React Server Component:

\`\`\`tsx
// app/[slug]/page.tsx (Server Component)
import { IRichRenderer } from '@irich/renderer';
import { nextjsRenderers } from '@/components/renderers';

async function loadDocument(slug: string) {
  // Fetch JSON document from CMS / Database
  const res = await fetch(\`https://api.example.com/pages/\${slug}\`, { next: { revalidate: 60 } });
  return res.json();
}

export default async function Page({ params }: { params: { slug: string } }) {
  const document = await loadDocument(params.slug);

  return (
    <main>
      <IRichRenderer
        document={document}
        components={nextjsRenderers}
      />
    </main>
  );
}
\`\`\`

> **Note**: Because \`<IRichRenderer />\` does not load visual canvas controllers or property inspectors, your published bundle remains extremely lightweight.

---

## Visual Editor (Client Component)

Place your visual studio in a client-only route marked with \`'use client'\`:

\`\`\`tsx
// app/admin/editor/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createEditor, type EditorInstance } from '@irich/core';
import { IRichProvider, IRichInspector } from '@irich/react';
import { createNextjsRegistry } from '@/components/definitions';
import { initialDocument } from '@/components/sample-document';

export default function EditorPage() {
  const [editor, setEditor] = useState<EditorInstance | null>(null);

  useEffect(() => {
    const registry = createNextjsRegistry();
    const ed = createEditor({
      registry,
      initialDocument,
    });
    setEditor(ed);

    return () => ed.destroy();
  }, []);

  if (!editor) return <div>Loading Editor...</div>;

  return (
    <IRichProvider editor={editor}>
      <div className="editor-shell">
        <aside className="sidebar-right">
          <IRichInspector />
        </aside>
      </div>
    </IRichProvider>
  );
}
\`\`\`

---

## Hydration Best Practices

1. **Deterministic IDs**: Always assign stable \`NodeId\`s when constructing initial documents on the server.
2. **Responsive Fallbacks**: When rendering on the server, pass \`breakpoint="desktop"\` or resolve breakpoint queries on the client.
`,
  },
  {
    slug: 'react-vite',
    category: 'getting-started',
    categoryTitle: 'Getting Started',
    title: 'React + Vite Integration',
    description: 'How to build standalone Single-Page Applications (SPA) with iRich in Vite.',
    badge: 'React',
    sections: [
      { id: 'vite-setup', title: 'Vite Setup & Configuration' },
      { id: 'client-spa-architecture', title: 'SPA Architecture' },
      { id: 'localstorage-persistence', title: 'LocalStorage Persistence' },
      { id: 'production-bundle-verification', title: 'Production Bundle Verification' },
    ],
    content: `
## Vite Setup & Configuration

iRich is completely decoupled from meta-framework runtimes. It runs natively in standard React + Vite SPAs with zero shims:

\`\`\`bash
# Create Vite React app
pnpm create vite my-irich-app --template react-ts
cd my-irich-app

# Install iRich packages
pnpm add @irich/core @irich/react @irich/renderer @irich/rich-text
\`\`\`

---

## SPA Architecture

In a single-page app, you can easily switch between **Visual Studio Editor** and **Live Published Preview** using local React state:

\`\`\`tsx
// src/App.tsx
import { useState, useMemo } from 'react';
import { createEditor } from '@irich/core';
import { IRichProvider, IRichInspector, LocalStorageAdapter, useIRichAutosave } from '@irich/react';
import { IRichRenderer } from '@irich/renderer';
import { createViteRegistry } from './components/definitions';
import { viteRenderers } from './components/renderers';
import { initialDocument } from './components/sample-document';

export default function App() {
  const [mode, setMode] = useState<'preview' | 'editor'>('preview');

  const editor = useMemo(() => {
    return createEditor({
      registry: createViteRegistry(),
      initialDocument,
    });
  }, []);

  return (
    <IRichProvider editor={editor}>
      <header className="navbar">
        <button onClick={() => setMode(mode === 'preview' ? 'editor' : 'preview')}>
          {mode === 'preview' ? 'Open Visual Studio' : 'Switch to Live Preview'}
        </button>
      </header>

      {mode === 'preview' ? (
        <IRichRenderer document={editor.getDocument()} components={viteRenderers} />
      ) : (
        <div className="studio-layout">
          <main className="canvas-area" />
          <aside className="inspector-area">
            <IRichInspector />
          </aside>
        </div>
      )}
    </IRichProvider>
  );
}
\`\`\`

---

## LocalStorage Persistence

Use \`LocalStorageAdapter\` to persist document edits automatically across browser refreshes:

\`\`\`tsx
import { useMemo } from 'react';
import { LocalStorageAdapter, useIRichAutosave } from '@irich/react';

function StudioEditor() {
  const adapter = useMemo(() => new LocalStorageAdapter(), []);

  const { isSaving, lastSavedAt } = useIRichAutosave({
    documentId: 'my_spa_document',
    adapter,
    debounceMs: 500,
  });

  return (
    <div className="status-badge">
      {isSaving ? 'Saving...' : 'Saved to LocalStorage'}
    </div>
  );
}
\`\`\`

---

## Production Bundle Verification

Run the Vite production build:

\`\`\`bash
pnpm build
\`\`\`

Vite and Rollup will tree-shake and bundle cleanly without any Next.js runtime warnings.
`,
  },
];
