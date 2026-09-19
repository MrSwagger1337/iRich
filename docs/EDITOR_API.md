# iRich Editor API Specification

> Core editor state machine, command dispatch, transaction pipeline, and React hook bindings for **iRich**.

---

## 1. Core Editor State Machine (`@irich/core`)

The editor instance manages document lifecycle, selection, transaction history, and event subscriptions independently of React.

### TypeScript API

```typescript
import type { IRichDocument, IRichNode, NodeId, JSONValue } from './document';
import type { ComponentDefinition } from './component';

export interface EditorState {
  document: IRichDocument;
  selection: NodeId | null;
  hoveredNodeId: NodeId | null;
  canUndo: boolean;
  canRedo: boolean;
}

export interface InsertNodePayload {
  node: IRichNode;
  parentId: NodeId;
  slot?: string;
  index?: number;
}

export interface MoveNodePayload {
  nodeId: NodeId;
  targetParentId: NodeId;
  targetSlot?: string;
  targetIndex?: number;
}

export interface UpdatePropsPayload {
  nodeId: NodeId;
  props: Record<string, JSONValue>;
}

export interface EditorCommands {
  insertNode(payload: InsertNodePayload): void;
  removeNode(nodeId: NodeId): void;
  moveNode(payload: MoveNodePayload): void;
  updateNodeProps(payload: UpdatePropsPayload): void;
  duplicateNode(nodeId: NodeId): NodeId;
  replaceDocument(document: IRichDocument): void;
  selectNode(nodeId: NodeId | null): void;
  hoverNode(nodeId: NodeId | null): void;
  undo(): void;
  redo(): void;
  batch(callback: () => void): void;
}

export interface EditorInstance {
  getState(): EditorState;
  getDocument(): IRichDocument;
  subscribe(listener: (state: EditorState) => void): () => void;
  subscribeToNode(nodeId: NodeId, listener: (node: IRichNode | undefined) => void): () => void;
  dispatch<T>(commandName: string, payload: T): void;
  commands: EditorCommands;
  destroy(): void;
}

export interface CreateEditorOptions {
  initialDocument?: IRichDocument;
  components?: ComponentDefinition[];
  plugins?: unknown[];
}

export function createEditor(options?: CreateEditorOptions): EditorInstance;
```

---

## 2. Built-in Core Commands

All mutations occur through formal command execution:

```
+-------------------+--------------------------------------------------------------------+
| Command           | Semantics & Validation Rules                                       |
+-------------------+--------------------------------------------------------------------+
| insertNode        | Inserts a newly generated node into specified parent slot & index. |
| removeNode        | Recursively removes node and all its child subtrees.               |
| moveNode          | Moves node across parents/slots. Forbids moving into descendants.  |
| updateNodeProps   | Shallow/deep merges prop updates into the targeted node.           |
| duplicateNode     | Deep-clones subtree, generating fresh unique IDs for every node.   |
| replaceDocument   | Atomically validates and swaps entire document tree & metadata.    |
| selectNode        | Updates active selection pointer for Inspector and canvas outlines.|
| undo / redo       | Steps through transaction journal with atomic state rollbacks.     |
| batch             | Combines multiple sequential commands into a single undoable step. |
+-------------------+--------------------------------------------------------------------+
```

### `replaceDocument(document: IRichDocument)` Semantics

The `replaceDocument` command is designed for complete document replacement (such as importing documents from a CMS or applying an AI-transformed version):

1. **Pre-mutation Validation**: Runs full invariant validation (`validateDocumentInvariants`). If the document is invalid (e.g., duplicate IDs, missing root, malformed nodes), the command is aborted and editor state remains completely unchanged.
2. **Immutable Swap**: Deeply clones and freezes the replacement document, ensuring no external mutable references are shared with editor state.
3. **Single-step Undo/Redo**: Records exactly ONE history entry. Calling `editor.commands.undo()` restores the entire previous document and metadata in a single step. Calling `redo()` re-applies the replacement.
4. **Redo Stack Clearing**: Replacing a document after performing an undo properly clears the redo stack branch.
5. **Deterministic Selection**:
   - If the currently selected `nodeId` exists in the replacement document, the selection is preserved.
   - If the selected `nodeId` does not exist in the replacement document, `selection` is reset to `null`.
6. **Event Lifecycle**: Emits `'document:replace'` with `{ previousDocument, document }`, followed by the standard `'document:change'` event.

---

## 3. React Integration API (`@irich/react`)

### `<IRichProvider />`

The central React context provider that mounts the editor instance and binds React state to core state transitions:

```tsx
import React from 'react';
import { IRichProvider, IRichCanvas, IRichToolbar, IRichInspector } from '@irich/react';
import { HeroBlock, SplitColumnsBlock } from './components';

export function VisualPageBuilder() {
  return (
    <IRichProvider
      components={[HeroBlock, SplitColumnsBlock]}
      initialDocument={{
        version: '1.0.0',
        root: { id: 'root', type: 'root', children: [] },
      }}
      onChange={(doc) => console.log('Document updated:', doc)}
    >
      <div className="irich-workspace-layout">
        <IRichToolbar />
        <main className="irich-main-content">
          <IRichCanvas />
        </main>
        <aside className="irich-inspector-panel">
          <IRichInspector />
        </aside>
      </div>
    </IRichProvider>
  );
}
```

---

## 4. Fine-Grained Reactivity Hooks

To prevent large-document performance degradation, iRich provides granular selector hooks:

### `useIRich()`

Returns top-level editor instance and global selection pointers:

```tsx
const { editor, state } = useIRich();
```

### `useNode(nodeId: NodeId)`

Subscribes strictly to updates for a specific `nodeId`. Touching other nodes does **not** cause this component to rerender:

```tsx
export function NodeInspector({ nodeId }: { nodeId: string }) {
  const node = useNode(nodeId);
  const { commands } = useEditor();

  if (!node) return null;

  return (
    <div>
      <h3>Editing: {node.type}</h3>
      <input
        value={(node.props.title as string) ?? ''}
        onChange={(e) =>
          commands.updateNodeProps({
            nodeId: node.id,
            props: { title: e.target.value },
          })
        }
      />
    </div>
  );
}
```

---

## 5. Copy / Paste & Clipboard Data Format

iRich uses standard browser clipboard events with a dedicated MIME type:

```
MIME Type: application/x-irich-node+json
```

When pasting:

1. The clipboard parser reads `application/x-irich-node+json`.
2. Fresh stable `NodeId`s are generated for the root and all children in the pasted tree.
3. The pasted subtree is validated against target slot `allowedTypes`.
4. `commands.insertNode` is dispatched as a single atomic transaction.
