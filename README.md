# iRich

> Embeddable, extensible visual content editor and page builder for React.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

iRich bridges structured rich-text authoring and modular component-based page composition. It empowers developers to embed a visual editing canvas into any React or Next.js application while outputting clean, JSON-serializable document trees.

---

## 1. What is iRich?

iRich is a headless, component-driven visual page editor and content authoring engine for React. Unlike monolithic WYSIWYG editors or proprietary website builders, iRich is designed from the ground up as a developer-first library:

- **Framework-Independent Core**: Pure TypeScript state engine with zero DOM or browser dependencies.
- **Strict JSON Document Model**: Stable node IDs, deterministic tree hierarchy, and 100% JSON-serializable documents.
- **Decoupled Architecture**: Lightweight renderer for published pages (`@irich/renderer`) isolated from the heavy visual editor runtime (`@irich/react`).

---

## 2. Why Use iRich?

- **No Vendor Lock-In**: You own the schema, the JSON data, and the React components rendered on the canvas.
- **Lightweight Production Rendering**: Published pages only load `@irich/renderer` (~5 KB), keeping production bundles small and fast with zero editor baggage.
- **Schema-Driven Inspector**: Component fields (`text`, `textarea`, `number`, `boolean`, `select`, `color`, `image`, `custom`) automatically generate type-safe property sidebars.
- **Responsive Values**: Native breakpoint overrides (`desktop`, `tablet`, `mobile`) that inherit and cascade seamlessly.
- **Command & History Pipeline**: Transactional commands (`insertNode`, `updateNode`, `moveNode`, `duplicateNode`) with robust undo/redo stacks.
- **AI-Ready**: Built-in declarative AI action protocol for safe, sandboxed AI-assisted editing without arbitrary code execution.

---

## 3. Installation

Install the required packages in your React project:

```bash
# Core engine, visual editor, and production renderer
pnpm add @irich/core @irich/react @irich/renderer

# Optional packages
pnpm add @irich/rich-text @irich/plugin-sdk @irich/ui
```

*(Or use `npm install` / `yarn add` / `bun add`)*

---

## 4. Quick Start (Simplest Example)

```tsx
import React, { useMemo } from 'react';
import {
  createDocument,
  createNode,
  createEditor,
  defineComponent,
  createComponentRegistry,
} from '@irich/core';
import { IRichProvider, IRichEditor } from '@irich/react';

// 1. Define component schema
const HeadingComponent = defineComponent({
  type: 'Heading',
  label: 'Heading',
  fields: {
    text: { type: 'text', defaultValue: 'Hello World' },
  },
});

export function EditorPage() {
  const editor = useMemo(() => {
    // 2. Register component
    const registry = createComponentRegistry();
    registry.register(HeadingComponent);

    // 3. Create initial document
    const initialDocument = createDocument({
      root: {
        id: 'root',
        type: 'root',
        children: [
          createNode({
            type: 'Heading',
            props: { text: 'Welcome to iRich' },
          }),
        ],
      },
    });

    // 4. Create editor instance
    return createEditor({ registry, initialDocument });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <IRichProvider editor={editor}>
        <IRichEditor />
      </IRichProvider>
    </div>
  );
}
```

---

## 5. Creating Custom Components

Registering a component in iRich requires two parts: a **schema definition** for the editor and a **React component** for rendering.

```tsx
import { defineComponent } from '@irich/core';
import type { ComponentRenderer } from '@irich/renderer';

// Step 1: Define the schema for the editor palette and inspector
export const HeroSchema = defineComponent({
  type: 'Hero',
  label: 'Hero Banner',
  description: 'Full-width hero banner with title and call-to-action',
  category: 'Layout',
  fields: {
    title: {
      type: 'text',
      label: 'Title',
      defaultValue: 'Build Faster with iRich',
      responsive: true,
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle',
      defaultValue: 'The extensible visual editor for modern React apps.',
    },
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      defaultValue: '#f8fafc',
    },
  },
});

// Step 2: Implement the React renderer component
export const HeroRenderer: ComponentRenderer<{
  title: string;
  subtitle: string;
  backgroundColor: string;
}> = ({ title, subtitle, backgroundColor }) => {
  return (
    <section style={{ backgroundColor, padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
};
```

---

## 6. Rendering Saved Content

In production or published pages, use `@irich/renderer` directly. It runs with zero editor dependencies and supports Server-Side Rendering (SSR).

```tsx
import React from 'react';
import { IRichRenderer } from '@irich/renderer';
import { HeroRenderer } from './components/Hero';

// Component registry mapping node types to React renderers
const components = {
  Hero: HeroRenderer,
};

export function PublishedPage({ documentJson }) {
  return (
    <main>
      <IRichRenderer document={documentJson} components={components} />
    </main>
  );
}
```

---

## 7. Next.js Support

iRich has first-class compatibility with Next.js (both App Router and Pages Router):

- **Server-Side Rendering (SSR) & React Server Components (RSC)**: `@irich/renderer` has zero browser dependencies and renders directly on the server.
- **Client-Side Editor**: Interactive visual editor controls (`@irich/react`) run inside standard `"use client"` components.

Explore the complete Next.js integration example in [`examples/nextjs-basic`](examples/nextjs-basic).

---

## 8. React + Vite Support

iRich is completely decoupled from Next.js and meta-frameworks. It works out of the box with standard React + Vite applications, SPAs, and micro-frontends.

Explore the standalone Vite example in [`examples/react-vite`](examples/react-vite).

---

## 9. Experimental APIs in v0.1.0

The following features are available in v0.1.0 under experimental status while API patterns are finalized:

- **AI Action Protocol** (`validateAIActions`, `applyAIActions` in `@irich/core`): The action schema and validation engine are stable, but high-level LLM streaming adapters and prompt templates will be finalized in upcoming releases.
- **Custom Canvas Overlays & Extension Slots** (`@irich/plugin-sdk`): Advanced visual injection slots on the canvas are evolving; plugin command registration and lifecycle hooks are stable.

---

## 10. Documentation & Resources

- **Architecture Guide**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Document Model Specification**: [`docs/DOCUMENT_MODEL.md`](docs/DOCUMENT_MODEL.md)
- **Component Schema API**: [`docs/COMPONENT_API.md`](docs/COMPONENT_API.md)
- **Editor & Command API**: [`docs/EDITOR_API.md`](docs/EDITOR_API.md)
- **Plugin SDK Guide**: [`docs/PLUGIN_API.md`](docs/PLUGIN_API.md)
- **Roadmap**: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- **Release Guide**: [`docs/RELEASING.md`](docs/RELEASING.md)
- **Interactive Documentation App**: [`apps/docs`](apps/docs)

---

## Workspace Development

```bash
# Install dependencies
pnpm install

# Run all checks (lint, typecheck, test, build)
pnpm check

# Start development playground & docs
pnpm dev
```

---

## License

MIT © MrSwagger1337 and iRich Contributors.
