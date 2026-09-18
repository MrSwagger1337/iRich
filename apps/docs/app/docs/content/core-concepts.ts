import type { DocPage } from '../types';

export const coreConceptsPages: DocPage[] = [
  {
    slug: 'documents',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Documents & State Serialization',
    description: 'The canonical JSON data model, document metadata, versioning, and structural invariants.',
    badge: 'Core',
    sections: [
      { id: 'document-structure', title: 'Document Structure' },
      { id: 'typescript-schema', title: 'TypeScript Schema' },
      { id: 'structural-invariants', title: 'Structural Invariants' },
      { id: 'serialization-guarantees', title: 'Serialization Guarantees' },
    ],
    content: `
## Document Structure

In iRich, the canonical state of any page or document is a strictly JSON-serializable tree structure. The root of the tree is represented by \`IRichDocument\`.

\`\`\`json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Landing Page",
    "description": "Product launch marketing page"
  },
  "root": {
    "id": "root",
    "type": "root",
    "props": {},
    "children": [
      {
        "id": "hero-1",
        "type": "Hero",
        "props": {
          "title": "Empowering Creative Teams",
          "align": "center"
        }
      }
    ]
  }
}
\`\`\`

---

## TypeScript Schema

The document schema is exported directly from \`@irich/core\`:

\`\`\`typescript
import type { JSONValue, NodeId } from '@irich/core';

export interface IRichDocument {
  /**
   * Schema version string for deterministic migrations (e.g. "1.0.0").
   */
  version: string;

  /**
   * Root node containing the entire hierarchical component tree.
   */
  root: IRichNode;

  /**
   * Document-level metadata (SEO, author, background styles).
   */
  metadata?: Record<string, JSONValue>;
}

export function createDocument(initial?: Partial<IRichDocument>): IRichDocument {
  return {
    version: '1.0.0',
    metadata: {},
    root: {
      id: 'root',
      type: 'root',
      props: {},
      children: [],
      ...initial?.root,
    },
    ...initial,
  };
}
\`\`\`

---

## Structural Invariants

Every document managed by iRich must satisfy 8 strict invariants:

1. **Global ID Uniqueness**: Every \`id\` (\`NodeId\`) in the tree must be unique across the document.
2. **Root Singularity**: Exactly one Root Node exists at the top of the tree hierarchy.
3. **Acyclic Structure**: Circular references or self-parenting are strictly prohibited.
4. **Valid Move Target**: A node cannot be moved into any of its own descendants.
5. **Component Registration**: Every node \`type\` must exist in the active \`ComponentRegistry\`.
6. **Strict JSON Value**: Props must only contain strings, numbers, booleans, arrays, plain objects, or null.
7. **Slot Conformance**: Named slots and child limits are verified during insertion and moves.
8. **Pure Immutability**: All mutations produce a new document reference with structural sharing.

---

## Serialization Guarantees

Because canonical document state never contains DOM nodes, functions, or class instances:

\`\`\`typescript
// Deterministic roundtrip guarantee:
const jsonString = JSON.stringify(doc);
const parsedDoc = JSON.parse(jsonString);
JSON.stringify(parsedDoc) === jsonString; // true
\`\`\`
`,
  },
  {
    slug: 'nodes',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Nodes & Slot Architecture',
    description: 'Understanding stable NodeIds, linear children, named multi-zone slots, and node metadata.',
    badge: 'Core',
    sections: [
      { id: 'node-interface', title: 'The IRichNode Interface' },
      { id: 'linear-children-vs-slots', title: 'Linear Children vs Named Slots' },
      { id: 'stable-node-ids', title: 'Stable Node IDs' },
      { id: 'node-metadata', title: 'Node Metadata' },
    ],
    content: `
## The IRichNode Interface

A node represents a single block, component, or layout element in the document tree:

\`\`\`typescript
export interface IRichNode {
  /**
   * Unique, stable identifier preserved across reorders, moves, and edits.
   */
  id: NodeId;

  /**
   * Registered component type (e.g. 'Hero', 'Card', 'Container', 'RichText').
   */
  type: string;

  /**
   * Plain JSON-serializable properties passed to the component renderer.
   */
  props: Record<string, JSONValue>;

  /**
   * Default children for linear single-zone containers.
   */
  children?: IRichNode[];

  /**
   * Named multi-zone slots for complex layouts (e.g. 'header', 'sidebar', 'footer').
   */
  slots?: Record<string, IRichNode[]>;

  /**
   * Non-rendered node metadata (e.g. collapsed in layers panel, locked).
   */
  meta?: Record<string, JSONValue>;
}
\`\`\`

---

## Linear Children vs Named Slots

iRich unifies single-column nesting and complex multi-column layouts into a cohesive slot model:

### Linear Children (Single Drop Zone)
Used for standard vertical stacks and flex containers:

\`\`\`json
{
  "id": "container-1",
  "type": "Container",
  "props": { "maxWidth": "wide" },
  "children": [
    { "id": "heading-1", "type": "Heading", "props": { "text": "Hello" } },
    { "id": "btn-1", "type": "Button", "props": { "label": "Get Started" } }
  ]
}
\`\`\`

### Named Slots (Multi-Zone Layouts)
Used for split columns, headers, footers, and modal regions:

\`\`\`json
{
  "id": "split-card-1",
  "type": "SplitCard",
  "props": { "ratio": "50-50" },
  "slots": {
    "left": [
      { "id": "heading-1", "type": "Heading", "props": { "text": "Left Column" } }
    ],
    "right": [
      { "id": "image-1", "type": "Image", "props": { "src": "/photo.jpg" } }
    ]
  }
}
\`\`\`

---

## Stable Node IDs

Every node must possess a stable \`NodeId\`. Use \`createNode()\` to generate fresh UUID-based IDs automatically:

\`\`\`typescript
import { createNode } from '@irich/core';

const node = createNode({
  type: 'Button',
  props: { label: 'Click Me' },
});
// node.id === "btn-8f92a10c" (guaranteed unique)
\`\`\`

---

## Node Metadata

The \`meta\` property stores non-rendering editor configuration:
- \`meta.isLocked\`: Prevents accidental deletion or moving.
- \`meta.collapsedInTree\`: Layers tree expansion state.
- \`meta.customLabel\`: User-assigned display label in outline panel.
`,
  },
  {
    slug: 'components',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Component Definitions & Registry',
    description: 'Declaring component schemas, categories, default properties, and registering them in ComponentRegistry.',
    badge: 'Core',
    sections: [
      { id: 'defining-components', title: 'Defining Components' },
      { id: 'component-registry', title: 'Component Registry' },
      { id: 'default-props-resolution', title: 'Default Props Resolution' },
      { id: 'runtime-prop-validation', title: 'Runtime Prop Validation' },
    ],
    content: `
## Defining Components

Components in iRich are declared with explicit schemas using \`defineComponent\`:

\`\`\`typescript
import { defineComponent } from '@irich/core';

export const CardComponent = defineComponent({
  type: 'Card',
  label: 'Feature Card',
  category: 'Marketing',
  description: 'Highlight card with title, description, and status tag.',
  icon: 'credit-card',
  canHaveChildren: false,

  fields: {
    title: {
      type: 'text',
      label: 'Card Title',
      defaultValue: 'Feature Title',
    },
    description: {
      type: 'textarea',
      label: 'Description',
      defaultValue: 'Short feature explanation.',
    },
    variant: {
      type: 'select',
      label: 'Card Style',
      defaultValue: 'elevated',
      options: [
        { label: 'Elevated (Shadow)', value: 'elevated' },
        { label: 'Outlined (Border)', value: 'outline' },
        { label: 'Flat (Subtle)', value: 'flat' },
      ],
    },
    isNew: {
      type: 'boolean',
      label: 'Show "NEW" Tag',
      defaultValue: false,
    },
  },
});
\`\`\`

---

## Component Registry

The \`ComponentRegistry\` manages registered definitions, query lookups, and validation:

\`\`\`typescript
import { createComponentRegistry } from '@irich/core';
import { CardComponent, HeroComponent, ContainerComponent } from './components';

export function createMyRegistry() {
  const registry = createComponentRegistry();

  // Register components
  registry.register(CardComponent);
  registry.register(HeroComponent);
  registry.register(ContainerComponent);

  return registry;
}

const registry = createMyRegistry();
registry.has('Card'); // true
const cardDef = registry.get('Card');
const allDefs = registry.getAll();
\`\`\`

---

## Default Props Resolution

When inserting a new node, default properties are computed automatically by combining field \`defaultValue\` declarations with component-level \`defaultProps\`:

\`\`\`typescript
const defaultProps = registry.getDefaultProps('Card');
// { title: 'Feature Title', description: 'Short feature explanation.', variant: 'elevated', isNew: false }
\`\`\`

---

## Runtime Prop Validation

You can validate props against the component field schema at any time:

\`\`\`typescript
const result = registry.validateProps('Card', {
  title: 'My Title',
  isNew: 'yes', // Invalid: expected boolean
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
\`\`\`
`,
  },
  {
    slug: 'fields',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Field Types & Schema Descriptors',
    description: 'Comprehensive guide to built-in schema field types: text, textarea, number, boolean, select, and color.',
    badge: 'Core',
    sections: [
      { id: 'built-in-field-types', title: 'Built-in Field Types' },
      { id: 'field-type-table', title: 'Field Type Specifications' },
      { id: 'responsive-field-flag', title: 'Responsive Field Flag' },
      { id: 'field-validation-rules', title: 'Validation Rules' },
    ],
    content: `
## Built-in Field Types

iRich includes 6 core primitive field types:

\`\`\`typescript
import type { FieldDefinition } from '@irich/core';

// 1. Text Field
const textField: FieldDefinition = {
  type: 'text',
  label: 'Headline',
  placeholder: 'Enter text...',
  defaultValue: '',
};

// 2. Textarea Field
const textareaField: FieldDefinition = {
  type: 'textarea',
  label: 'Body Content',
  rows: 4,
  defaultValue: '',
};

// 3. Number Field
const numberField: FieldDefinition = {
  type: 'number',
  label: 'Padding (px)',
  min: 0,
  max: 120,
  step: 4,
  defaultValue: 16,
};

// 4. Boolean Field
const booleanField: FieldDefinition = {
  type: 'boolean',
  label: 'Enable Dark Mode',
  defaultValue: true,
};

// 5. Select Field
const selectField: FieldDefinition = {
  type: 'select',
  label: 'Alignment',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  defaultValue: 'left',
};

// 6. Color Field
const colorField: FieldDefinition = {
  type: 'color',
  label: 'Background Accent',
  defaultValue: '#6366f1',
};
\`\`\`

---

## Field Type Specifications

| Field Type | Form Control | Config Options | Default Fallback |
| :--- | :--- | :--- | :--- |
| **\`text\`** | Text Input | \`placeholder\`, \`minLength\`, \`maxLength\` | \`""\` |
| **\`textarea\`** | Multi-line Textarea | \`placeholder\`, \`rows\` | \`""\` |
| **\`number\`** | Numeric Stepper | \`min\`, \`max\`, \`step\`, \`unit\` | \`0\` |
| **\`boolean\`** | Toggle Switch / Checkbox | \`defaultValue\` | \`false\` |
| **\`select\`** | Dropdown Selector | \`options: Array<{ label, value }>\` | First option |
| **\`color\`** | Hex Color Picker | \`presetColors: string[]\` | \`"#000000"\` |

---

## Responsive Field Flag

Any field can opt into responsive breakpoint overrides by setting \`responsive: true\`:

\`\`\`typescript
fontSize: {
  type: 'number',
  label: 'Font Size (px)',
  defaultValue: 32,
  responsive: true, // Enables desktop, tablet, and mobile overrides!
}
\`\`\`
`,
  },
  {
    slug: 'editor',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Editor State Machine & Subscriptions',
    description: 'The Editor instance, lifecycle methods, fine-grained state subscriptions, and node listeners.',
    badge: 'Core',
    sections: [
      { id: 'creating-an-editor', title: 'Creating an Editor' },
      { id: 'editor-instance-api', title: 'EditorInstance API' },
      { id: 'fine-grained-subscriptions', title: 'Fine-Grained Subscriptions' },
      { id: 'event-listeners', title: 'Event Listeners' },
    ],
    content: `
## Creating an Editor

The \`createEditor()\` factory creates a headless, framework-independent editor state machine:

\`\`\`typescript
import { createEditor } from '@irich/core';
import { registry } from './registry';
import { initialDocument } from './sample';

const editor = createEditor({
  registry,
  initialDocument,
  enableHistory: true,
  maxHistorySize: 100,
});
\`\`\`

---

## EditorInstance API

\`\`\`typescript
export interface EditorInstance {
  // State Accessors
  getState(): EditorState;
  getDocument(): IRichDocument;
  getSelection(): NodeId | null;
  getNode(nodeId: NodeId): IRichNode | undefined;
  getRegistry(): ComponentRegistry | undefined;
  getActiveBreakpoint(): Breakpoint;
  getClipboard(): IRichNode | null;

  // Status Queries
  canUndo(): boolean;
  canRedo(): boolean;
  canPaste(): boolean;

  // Commands Pipeline
  commands: EditorCommands;

  // Subscriptions
  subscribe(listener: (state: EditorState) => void): () => void;
  subscribeToNode(nodeId: NodeId, listener: (node: IRichNode | undefined) => void): () => void;
  on<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): () => void;

  // Teardown
  destroy(): void;
}
\`\`\`

---

## Fine-Grained Subscriptions

To prevent full-tree re-renders when a single node property changes, iRich supports targeted subscriptions:

\`\`\`typescript
// Subscribe to global editor state:
const unsubState = editor.subscribe((state) => {
  console.log('Document version or selection changed');
});

// Subscribe strictly to a single node:
const unsubNode = editor.subscribeToNode('hero-1', (node) => {
  console.log('Hero-1 props updated:', node?.props);
});
\`\`\`

---

## Event Listeners

Listen to granular mutation events:

\`\`\`typescript
editor.on('node:insert', ({ node, parentId, index }) => {
  console.log(\`Inserted \${node.type} into \${parentId} at index \${index}\`);
});

editor.on('node:remove', ({ node, parentId }) => {
  console.log(\`Removed \${node.id} from \${parentId}\`);
});

editor.on('node:update', ({ nodeId, nextProps }) => {
  console.log(\`Updated props for \${nodeId}\`, nextProps);
});
\`\`\`
`,
  },
  {
    slug: 'renderer',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Production Renderer & SSR',
    description: 'High-performance component rendering, SSR compatibility, and zero-editor bundle isolation.',
    badge: 'SSR',
    sections: [
      { id: 'renderer-architecture', title: 'Renderer Architecture' },
      { id: 'irich-renderer-component', title: '<IRichRenderer /> Component' },
      { id: 'writing-component-renderers', title: 'Writing Component Renderers' },
      { id: 'responsive-resolution', title: 'Server-Side Responsive Resolution' },
    ],
    content: `
## Renderer Architecture

\`@irich/renderer\` is a dedicated compilation and rendering package designed for production deployment:

- **Ultra-lightweight**: Under \`15kB\` gzipped.
- **Zero Editor Bundles**: Visual canvas overlays, drag-and-drop engines, and property sidebars are completely omitted.
- **SSR & RSC Compatible**: Can execute in pure Node.js, Next.js React Server Components, and Edge workers.

---

## <IRichRenderer /> Component

\`\`\`tsx
import { IRichRenderer } from '@irich/renderer';
import { HeroRenderer, CardRenderer, ContainerRenderer } from './renderers';

const components = {
  Hero: HeroRenderer,
  Card: CardRenderer,
  Container: ContainerRenderer,
};

export function PublishedPage({ document }: { document: any }) {
  return (
    <IRichRenderer
      document={document}
      components={components}
    />
  );
}
\`\`\`

---

## Writing Component Renderers

Component renderers receive resolved props and children:

\`\`\`tsx
import type { ComponentRenderer, NodeRendererProps } from '@irich/renderer';

interface CardProps {
  title?: string;
  description?: string;
}

export const CardRenderer: ComponentRenderer<CardProps> = ({
  node,
  children,
  title = (node.props.title as string) || 'Untitled Card',
  description = (node.props.description as string) || '',
}: NodeRendererProps<CardProps>) => {
  return (
    <div className="card-box">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
};
\`\`\`

---

## Server-Side Responsive Resolution

When rendering on the server, you can specify the target breakpoint:

\`\`\`tsx
<IRichRenderer
  document={document}
  components={components}
  breakpoint="mobile"
/>
\`\`\`
`,
  },
  {
    slug: 'commands',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Command Pipeline & Mutations',
    description: 'Structured command dispatching: insertNode, removeNode, moveNode, updateNode, duplicateNode, copy/paste, and batch.',
    badge: 'Core',
    sections: [
      { id: 'mutation-rule', title: 'Command Mutation Rule' },
      { id: 'built-in-commands', title: 'Built-in Commands' },
      { id: 'batch-transactions', title: 'Batch Transactions' },
      { id: 'clipboard-commands', title: 'Clipboard Operations' },
    ],
    content: `
## Command Mutation Rule

> **Important**: React components and UI event handlers must **never** mutate document state directly. All mutations must flow through \`editor.commands\`.

---

## Built-in Commands

\`\`\`typescript
const { commands } = editor;

// 1. Insert Node
const newNodeId = commands.insertNode({
  node: createNode({ type: 'Button', props: { label: 'Click' } }),
  parentId: 'root',
  index: 0,
});

// 2. Update Node Props
commands.updateNode({
  nodeId: newNodeId,
  props: { label: 'Submit Form' },
});

// 3. Move Node
commands.moveNode({
  nodeId: newNodeId,
  targetParentId: 'card-1',
  targetIndex: 1,
});

// 4. Duplicate Node
const duplicatedId = commands.duplicateNode(newNodeId);

// 5. Remove Node
commands.removeNode(newNodeId);

// 6. Select Node
commands.selectNode(duplicatedId);

// 7. Change Viewport Breakpoint
commands.setBreakpoint('mobile');
\`\`\`

---

## Batch Transactions

Combine multiple mutations into a single atomic undoable transaction using \`commands.batch()\`:

\`\`\`typescript
commands.batch(() => {
  const containerId = commands.insertNode({
    node: createNode({ type: 'Container' }),
    parentId: 'root',
  });

  commands.insertNode({
    node: createNode({ type: 'Heading', props: { text: 'Title' } }),
    parentId: containerId,
  });

  commands.insertNode({
    node: createNode({ type: 'Button', props: { label: 'Action' } }),
    parentId: containerId,
  });
});

// A single Undo will revert the container and all its children together!
commands.undo();
\`\`\`

---

## Clipboard Operations

\`\`\`typescript
// Copy active selection to internal clipboard
commands.copyNode();

// Cut active selection
commands.cutNode();

// Paste clipboard subtree with fresh stable IDs
commands.pasteNode({ targetParentId: 'root' });
\`\`\`
`,
  },
  {
    slug: 'history',
    category: 'core-concepts',
    categoryTitle: 'Core Concepts',
    title: 'Undo/Redo History Stack',
    description: 'Transaction journaling, state snapshots, atomic rollbacks, and history management.',
    badge: 'Core',
    sections: [
      { id: 'history-journal', title: 'History Journal' },
      { id: 'undo-redo-hooks', title: 'Undo / Redo React Hook' },
      { id: 'clearing-history', title: 'Clearing History' },
    ],
    content: `
## History Journal

Every mutation command automatically produces a transaction journal entry storing previous state snapshots:

\`\`\`typescript
editor.canUndo(); // boolean
editor.canRedo(); // boolean

editor.commands.undo(); // Reverts last transaction
editor.commands.redo(); // Replays reverted transaction
\`\`\`

---

## Undo / Redo React Hook

Use the \`useIRichHistory()\` hook in your toolbar buttons:

\`\`\`tsx
import { useIRichHistory } from '@irich/react';

export function HistoryButtons() {
  const { canUndo, canRedo, undo, redo } = useIRichHistory();

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={undo} disabled={!canUndo} title="Undo (Cmd+Z)">
        ↺ Undo
      </button>
      <button onClick={redo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
        ↻ Redo
      </button>
    </div>
  );
}
\`\`\`

---

## Clearing History

When loading a fresh document or resetting changes, clear the history journal:

\`\`\`typescript
editor.clearHistory();
\`\`\`
`,
  },
];
