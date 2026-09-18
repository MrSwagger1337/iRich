import type { DocPage } from '../types';

export const advancedPages: DocPage[] = [
  {
    slug: 'plugins',
    category: 'advanced',
    categoryTitle: 'Advanced',
    title: 'Plugin Architecture (@irich/plugin-sdk)',
    description: 'Extending iRich with custom commands, lifecycle hooks, middleware, and plugin isolation.',
    badge: 'Core',
    sections: [
      { id: 'plugin-sdk-overview', title: 'Plugin SDK Overview' },
      { id: 'defining-a-plugin', title: 'Defining a Plugin' },
      { id: 'plugin-lifecycle', title: 'Lifecycle Hooks' },
      { id: 'plugin-isolation', title: 'Plugin Isolation Guarantees' },
    ],
    content: `
## Plugin SDK Overview

\`@irich/plugin-sdk\` provides a headless extension model for iRich. Plugins can contribute custom commands, event listeners, component definitions, and lifecycle behaviors without directly mutating internal editor state.

---

## Defining a Plugin

Create modular extensions with \`definePlugin\`:

\`\`\`typescript
import { definePlugin, type PluginContext } from '@irich/plugin-sdk';

export const wordCountPlugin = definePlugin({
  name: 'word-count',
  version: '1.0.0',

  setup(ctx: PluginContext) {
    // Listen to document mutations
    ctx.on('document:change', ({ document }) => {
      console.log('Document updated. Recalculating word count...');
    });

    // Register a custom command
    ctx.registerCommand('logStats', (context) => {
      const doc = context.editor.getDocument();
      console.log('Document metadata:', doc.metadata);
    });
  },

  teardown(ctx: PluginContext) {
    console.log('Plugin unmounted and cleaned up.');
  },
});
\`\`\`

---

## Lifecycle Hooks

1. **\`setup(ctx)\`**: Invoked when the editor mounts and the plugin is registered. Use this to bind event listeners and register commands.
2. **\`teardown(ctx)\`**: Invoked on editor destruction. Clean up timers, external streams, and DOM listeners.

---

## Plugin Isolation Guarantees

- **No Private State Access**: Plugins cannot access internal transaction journal buffers or private class state.
- **Duplicate Registration Guard**: Registering the same plugin twice throws a \`DuplicatePluginError\`.
- **Command-Based Mutations**: Any document mutation triggered by a plugin must dispatch a command through \`ctx.editor.commands\`.
`,
  },
  {
    slug: 'storage',
    category: 'advanced',
    categoryTitle: 'Advanced',
    title: 'Storage Adapters & Autosave',
    description: 'IRichStorageAdapter interface, LocalStorageAdapter, MemoryStorageAdapter, and useIRichAutosave.',
    badge: 'Stable',
    sections: [
      { id: 'storage-adapter-interface', title: 'Storage Adapter Interface' },
      { id: 'built-in-adapters', title: 'Built-in Adapters' },
      { id: 'autosave-hook', title: 'Autosave Hook (useIRichAutosave)' },
      { id: 'custom-database-adapter', title: 'Building a Custom Database Adapter' },
    ],
    content: `
## Storage Adapter Interface

iRich abstracts document persistence behind a clean, Promise-based storage interface:

\`\`\`typescript
import type { IRichDocument } from '@irich/core';

export interface IRichStorageAdapter {
  load(id: string): Promise<IRichDocument | null>;
  save(id: string, document: IRichDocument): Promise<void>;
  delete?(id: string): Promise<void>;
}
\`\`\`

---

## Built-in Adapters

### 1. \`MemoryStorageAdapter\` (\`@irich/core\`)
Headless in-memory adapter perfect for unit tests and temporary sessions:

\`\`\`typescript
import { MemoryStorageAdapter } from '@irich/core';

const storage = new MemoryStorageAdapter();
await storage.save('page-1', myDoc);
const loaded = await storage.load('page-1');
\`\`\`

### 2. \`LocalStorageAdapter\` (\`@irich/react\`)
Browser-capable adapter persisting documents to \`window.localStorage\`:

\`\`\`typescript
import { LocalStorageAdapter } from '@irich/react';

const storage = new LocalStorageAdapter({ prefix: 'my_app_docs:' });
\`\`\`

---

## Autosave Hook (useIRichAutosave)

Debounce document mutations and track saving state automatically in React:

\`\`\`tsx
import { useMemo } from 'react';
import { LocalStorageAdapter, useIRichAutosave } from '@irich/react';

export function AutosaveStatus() {
  const adapter = useMemo(() => new LocalStorageAdapter(), []);

  const { isSaving, isSaved, error, lastSavedAt } = useIRichAutosave({
    documentId: 'active_doc',
    adapter,
    debounceMs: 600,
  });

  if (isSaving) return <span style={{ color: '#fbbf24' }}>Saving...</span>;
  if (error) return <span style={{ color: '#ef4444' }}>Save Failed</span>;
  return <span style={{ color: '#34d399' }}>All changes saved</span>;
}
\`\`\`

---

## Building a Custom Database Adapter

Connect iRich directly to Postgres, Prisma, MongoDB, or Supabase:

\`\`\`typescript
import type { IRichStorageAdapter, IRichDocument } from '@irich/core';

export class ApiStorageAdapter implements IRichStorageAdapter {
  constructor(private baseUrl: string) {}

  async load(id: string): Promise<IRichDocument | null> {
    const res = await fetch(\`\${this.baseUrl}/api/documents/\${id}\`);
    if (res.status === 404) return null;
    return res.json();
  }

  async save(id: string, document: IRichDocument): Promise<void> {
    await fetch(\`\${this.baseUrl}/api/documents/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document),
    });
  }
}
\`\`\`
`,
  },
  {
    slug: 'custom-components',
    category: 'advanced',
    categoryTitle: 'Advanced',
    title: 'Custom Layout Containers & Multi-Zone Slots',
    description: 'Building custom multi-column grids, split layouts, and nested slot dropzones.',
    badge: 'React',
    sections: [
      { id: 'container-definition', title: 'Container Schema Definition' },
      { id: 'container-renderer', title: 'Container React Renderer' },
      { id: 'multi-zone-slots', title: 'Multi-Zone Named Slots' },
    ],
    content: `
## Container Schema Definition

To allow a component to accept children on the canvas, set \`canHaveChildren: true\`:

\`\`\`typescript
import { defineComponent } from '@irich/core';

export const GridContainerComponent = defineComponent({
  type: 'GridContainer',
  label: 'Multi-Column Grid',
  category: 'Layout',
  canHaveChildren: true,
  fields: {
    columns: {
      type: 'select',
      label: 'Column Layout',
      defaultValue: '2',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    gap: {
      type: 'select',
      label: 'Gap Spacing',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
  },
});
\`\`\`

---

## Container React Renderer

Receive \`children\` in your component renderer and arrange them into your layout structure:

\`\`\`tsx
import type { NodeRendererProps } from '@irich/renderer';

export function GridContainerRenderer({
  node,
  children,
  columns = node.props.columns as string,
  gap = node.props.gap as string,
}: NodeRendererProps<{ columns?: string; gap?: string }>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
        gap: gap === 'small' ? '1rem' : gap === 'large' ? '3rem' : '2rem',
      }}
    >
      {children}
    </div>
  );
}
\`\`\`
`,
  },
  {
    slug: 'custom-fields',
    category: 'advanced',
    categoryTitle: 'Advanced',
    title: 'Custom Fields & Inspector Controls',
    description: 'Extending the property schema with custom field types and custom React control components.',
    badge: 'Core',
    sections: [
      { id: 'custom-field-types', title: 'Registering Custom Field Types' },
      { id: 'custom-inspector-control', title: 'Custom Inspector UI Control' },
    ],
    content: `
## Registering Custom Field Types

You can register custom field types in the component registry with custom validation logic:

\`\`\`typescript
import { createComponentRegistry } from '@irich/core';

const registry = createComponentRegistry();

registry.registerFieldType({
  type: 'url',
  validate(value) {
    if (typeof value !== 'string') return { valid: false, error: 'Expected string' };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  },
  getDefaultValue() {
    return 'https://';
  },
});
\`\`\`

---

## Custom Inspector UI Control

In React, you can map custom field types to specialized UI components (like icon selectors, asset pickers, or date range inputs).
`,
  },
  {
    slug: 'ai-actions',
    category: 'advanced',
    categoryTitle: 'Advanced',
    title: 'AI Action Protocol (Experimental)',
    description: 'Strongly typed action protocol for secure AI-assisted editing without arbitrary code execution.',
    badge: 'Experimental',
    sections: [
      { id: 'security-philosophy', title: 'Security Philosophy' },
      { id: 'action-schemas', title: 'Allowed Action Schemas' },
      { id: 'validation-and-execution', title: 'validateAIActions & applyAIActions' },
      { id: 'dry-run-support', title: 'Dry-Run Validation' },
    ],
    content: `
## Security Philosophy

> **[Experimental API]**: The AI Action Protocol is designed to allow LLMs to propose changes to an iRich document with strict mathematical safety.

### Invariants:
1. **No Code Execution**: AI models never return executable JavaScript, JSX, or script tags.
2. **Validated Mutations Only**: AI models return structured JSON action manifests.
3. **Guardrails**: All actions are validated against document invariants, component definitions, and schema bounds before execution.

---

## Allowed Action Schemas

\`\`\`typescript
import type { AIAction } from '@irich/core';

// 1. Insert Node
const insertAction: AIAction = {
  action: 'insertNode',
  parentId: 'root',
  node: {
    type: 'Hero',
    props: { title: 'AI Generated Headline' },
  },
};

// 2. Update Props
const updateAction: AIAction = {
  action: 'updateProps',
  nodeId: 'hero-1',
  props: { subtitle: 'Updated description from AI prompt.' },
};

// 3. Remove Node
const removeAction: AIAction = {
  action: 'removeNode',
  nodeId: 'card-old',
};

// 4. Move Node
const moveAction: AIAction = {
  action: 'moveNode',
  nodeId: 'btn-1',
  targetParentId: 'footer',
};
\`\`\`

---

## validateAIActions & applyAIActions

\`\`\`typescript
import { validateAIActions, applyAIActions } from '@irich/core';

const actions = [
  { action: 'updateProps', nodeId: 'hero-1', props: { title: 'New Title' } },
];

// 1. Dry run validation
const result = validateAIActions(editor.getDocument(), actions, {
  registry: editor.getRegistry(),
});

if (result.valid) {
  // 2. Apply actions through normal editor command pipeline
  applyAIActions(editor, actions);
} else {
  console.error('AI actions rejected:', result.errors);
}
\`\`\`
`,
  },
];
