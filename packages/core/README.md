# @irich/core

> Canonical document data model, state machine, command pipeline, and component registry for **iRich**.

`@irich/core` is pure TypeScript with **zero React, DOM, or browser runtime dependencies**. It executes identically in Node.js, Web Workers, and Edge runtimes.

---

## Features

- **Strict JSON-Serializable Document Model**: Canonical document state contains zero non-plain objects, DOM nodes, or functions.
- **Command & Transaction Pipeline**: Dispatches mutations (`insertNode`, `removeNode`, `moveNode`, `updateNode`, `duplicateNode`, `batch`) with atomic undo/redo history.
- **Component Registry**: Schema definitions (`defineComponent`, `createComponentRegistry`) with built-in field descriptors (`text`, `textarea`, `number`, `boolean`, `select`, `color`).
- **First-Class Responsive Values**: Non-destructive breakpoint overrides (`desktop`, `tablet`, `mobile`) with cascading fallback inheritance.
- **Pluggable Persistence**: `IRichStorageAdapter` and `MemoryStorageAdapter`.
- **AI Action Protocol**: *(Experimental)* Strongly typed action schemas and validation guardrails.

---

## Installation

\`\`\`bash
pnpm add @irich/core
\`\`\`

---

## Basic Usage

\`\`\`typescript
import {
  createDocument,
  createNode,
  createEditor,
  defineComponent,
  createComponentRegistry,
} from '@irich/core';

// 1. Define a component schema
export const Hero = defineComponent({
  type: 'Hero',
  fields: {
    title: { type: 'text', defaultValue: 'Welcome' },
  },
});

// 2. Create registry
const registry = createComponentRegistry();
registry.register(Hero);

// 3. Initialize editor
const editor = createEditor({
  registry,
  initialDocument: createDocument(),
});

// 4. Dispatch commands
editor.commands.insertNode({
  node: createNode({ type: 'Hero', props: { title: 'Hello World' } }),
  parentId: 'root',
});
\`\`\`

---

## License

MIT
