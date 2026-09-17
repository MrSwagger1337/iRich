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
| selectNode        | Updates active selection pointer for Inspector and canvas outlines.|
| undo / redo       | Steps through transaction journal with atomic state rollbacks.     |
| batch             | Combines multiple sequential commands into a single undoable step. |
+-------------------+--------------------------------------------------------------------+
```

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
