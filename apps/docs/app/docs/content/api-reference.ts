import type { DocPage } from '../types';

export const apiReferencePages: DocPage[] = [
  {
    slug: 'core',
    category: 'api',
    categoryTitle: 'API Reference',
    title: '@irich/core API Reference',
    description: 'Framework-independent document engine, command pipeline, component registry, and state models.',
    badge: 'Core',
    sections: [
      { id: 'factories-and-creators', title: 'Factories & Creators' },
      { id: 'editor-instance-methods', title: 'EditorInstance Methods' },
      { id: 'command-payloads', title: 'Command Payloads' },
      { id: 'responsive-helpers', title: 'Responsive Helpers' },
      { id: 'ai-actions-api', title: 'AI Action API' },
    ],
    content: `
## Factories & Creators

\`\`\`typescript
import {
  createEditor,
  createComponentRegistry,
  defineComponent,
  createDocument,
  createNode,
} from '@irich/core';
\`\`\`

### \`createEditor(config?: EditorConfig): EditorInstance\`
Creates a new editor instance with an optional registry, initial document, and breakpoint configuration.

### \`createComponentRegistry(): ComponentRegistry\`
Instantiates a new component definition registry.

### \`defineComponent<T>(definition: ComponentDefinition<T>): ComponentDefinition<T>\`
Declares a validated component schema with field descriptors and categories.

### \`createDocument(initial?: Partial<IRichDocument>): IRichDocument\`
Constructs a valid canonical JSON document.

### \`createNode(params: CreateNodeParams): IRichNode\`
Creates a new document node with an automatically generated stable ID.

---

## EditorInstance Methods

- \`getState(): EditorState\`
- \`getDocument(): IRichDocument\`
- \`getSelection(): NodeId | null\`
- \`getNode(id: NodeId): IRichNode | undefined\`
- \`getRegistry(): ComponentRegistry | undefined\`
- \`getActiveBreakpoint(): Breakpoint\`
- \`getClipboard(): IRichNode | null\`
- \`canUndo(): boolean\`
- \`canRedo(): boolean\`
- \`canPaste(): boolean\`
- \`clearHistory(): void\`
- \`subscribe(listener: (state: EditorState) => void): () => void\`
- \`subscribeToNode(id: NodeId, listener: (node: IRichNode | undefined) => void): () => void\`
- \`destroy(): void\`

---

## Command Payloads

- \`insertNode(payload: InsertNodePayload): NodeId\`
- \`removeNode(nodeId: NodeId): void\`
- \`updateNode(payload: UpdateNodePayload): void\`
- \`moveNode(payload: MoveNodePayload): void\`
- \`duplicateNode(payload: DuplicateNodePayload | NodeId): NodeId\`
- \`copyNode(nodeId?: NodeId): boolean\`
- \`cutNode(nodeId?: NodeId): boolean\`
- \`pasteNode(payload?: PasteNodePayload): NodeId | undefined\`
- \`selectNode(nodeId: NodeId | null): void\`
- \`setBreakpoint(breakpoint: Breakpoint): void\`
- \`undo(): boolean\`
- \`redo(): boolean\`
- \`batch(callback: () => void): void\`

---

## Responsive Helpers

- \`resolveResponsiveValue<T>(value: ResponsiveValue<T>, breakpoint: Breakpoint, defaultValue?: T): T\`
- \`isResponsiveObject<T>(value: unknown): boolean\`
- \`setResponsiveOverride<T>(current: ResponsiveValue<T>, breakpoint: Breakpoint, override: T): ResponsiveValue<T>\`

---

## AI Action API (Experimental)

- \`validateAIActions(doc: IRichDocument, actions: AIAction[], options?: ValidateOptions): ValidationResult\`
- \`applyAIActions(editor: EditorInstance, actions: AIAction[]): ApplyResult\`
`,
  },
  {
    slug: 'react',
    category: 'api',
    categoryTitle: 'API Reference',
    title: '@irich/react API Reference',
    description: 'React context providers, property inspector, hooks, drag/drop, keyboard shortcuts, and autosave.',
    badge: 'React',
    sections: [
      { id: 'components-and-providers', title: 'Components & Providers' },
      { id: 'react-hooks', title: 'React Hooks' },
      { id: 'storage-and-shortcuts', title: 'Storage & Keyboard Shortcuts' },
    ],
    content: `
## Components & Providers

\`\`\`tsx
import {
  IRichProvider,
  IRichInspector,
  IRichTextEditor,
  IRichTextRenderer,
} from '@irich/react';
\`\`\`

### \`<IRichProvider editor={editor}>{children}</IRichProvider>\`
The central context provider that connects React components to an active \`EditorInstance\`.

### \`<IRichInspector className={...} />\`
Dynamic property inspector component generating accessible controls from component schemas.

---

## React Hooks

\`\`\`typescript
import {
  useIRich,
  useIRichEditor,
  useIRichDocument,
  useIRichSelection,
  useIRichBreakpoint,
  useIRichHistory,
  useIRichNode,
  useIRichAutosave,
  useIRichKeyboardShortcuts,
} from '@irich/react';
\`\`\`

- **\`useIRichEditor()\`**: Returns the active \`EditorInstance\`.
- **\`useIRichDocument()\`**: Returns the current \`IRichDocument\` with reactive updates.
- **\`useIRichSelection()\`**: Returns \`{ selectedNodeId, selectNode, clearSelection }\`.
- **\`useIRichBreakpoint()\`**: Returns \`{ breakpoint, setBreakpoint }\`.
- **\`useIRichHistory()\`**: Returns \`{ canUndo, canRedo, undo, redo }\`.
- **\`useIRichNode(nodeId)\`**: Fine-grained subscription to a specific node.
- **\`useIRichAutosave(options)\`**: Debounced persistence manager.
- **\`useIRichKeyboardShortcuts(options?)\`**: Binds Undo, Redo, Copy, Paste, Duplicate, and Delete.

---

## Storage & Keyboard Shortcuts

- \`LocalStorageAdapter\`: Browser storage implementation of \`IRichStorageAdapter\`.
- \`isEditableElement(el)\`: Safe helper preventing shortcut capture in form inputs.
`,
  },
  {
    slug: 'renderer',
    category: 'api',
    categoryTitle: 'API Reference',
    title: '@irich/renderer API Reference',
    description: 'Lightweight, SSR-compatible production rendering components and registry.',
    badge: 'SSR',
    sections: [
      { id: 'renderer-components', title: 'Renderer Components' },
      { id: 'renderer-types', title: 'Renderer Types' },
    ],
    content: `
## Renderer Components

\`\`\`tsx
import { IRichRenderer, renderDocument } from '@irich/renderer';
\`\`\`

### \`<IRichRenderer document={doc} components={map} breakpoint="desktop" />\`
Traverses the document tree and renders corresponding React components.

---

## Renderer Types

\`\`\`typescript
import type {
  ComponentRenderer,
  NodeRendererProps,
  ComponentMap,
} from '@irich/renderer';

export type ComponentRenderer<T = any> = (props: NodeRendererProps<T>) => React.ReactNode;

export interface NodeRendererProps<T = any> {
  node: IRichNode;
  id: string;
  children?: React.ReactNode;
  // Props are spread dynamically with resolved responsive overrides
}
\`\`\`
`,
  },
  {
    slug: 'rich-text',
    category: 'api',
    categoryTitle: 'API Reference',
    title: '@irich/rich-text API Reference',
    description: 'Inline rich text models, formatting marks, and Tiptap abstraction.',
    badge: 'Stable',
    sections: [
      { id: 'rich-text-components', title: 'Rich Text Components' },
      { id: 'rich-text-helpers', title: 'Helper Functions' },
    ],
    content: `
## Rich Text Components

\`\`\`tsx
import {
  IRichTextEditor,
  IRichTextRenderer,
  RichTextToolbar,
  RichTextFloatingToolbar,
  useIRichText,
} from '@irich/rich-text';
\`\`\`

---

## Helper Functions

- \`isRichTextDocument(val: unknown): boolean\`
- \`ensureRichTextDocument(val: unknown): RichTextDocument\`
- \`createEmptyRichText(): RichTextDocument\`
- \`createRichTextFromText(text: string): RichTextDocument\`
- \`richTextToPlainText(doc: RichTextDocument): string\`
`,
  },
  {
    slug: 'plugin-sdk',
    category: 'api',
    categoryTitle: 'API Reference',
    title: '@irich/plugin-sdk API Reference',
    description: 'Plugin definition builders, lifecycle contracts, and plugin manager.',
    badge: 'Core',
    sections: [
      { id: 'define-plugin', title: 'definePlugin' },
      { id: 'plugin-manager', title: 'PluginManager' },
    ],
    content: `
## definePlugin

\`\`\`typescript
import { definePlugin, type IRichPlugin, type PluginContext } from '@irich/plugin-sdk';

export const myPlugin = definePlugin({
  name: 'my-plugin',
  version: '1.0.0',
  setup(ctx: PluginContext) {
    // initialize
  },
  teardown(ctx: PluginContext) {
    // cleanup
  },
});
\`\`\`

---

## PluginManager

\`\`\`typescript
import { createPluginManager } from '@irich/plugin-sdk';

const manager = createPluginManager({ editor });
manager.register(myPlugin);
\`\`\`
`,
  },
];
