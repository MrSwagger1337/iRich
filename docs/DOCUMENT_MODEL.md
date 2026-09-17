# iRich Document Model & State Specification

> Formal data structure, JSON serialization format, structural invariants, and state lifecycle for **iRich** documents.

---

## 1. Canonical Document Schema

An iRich document represents a structured, hierarchical tree of visual components and content nodes. It is strictly serializable to standard JSON.

### TypeScript Definitions

```typescript
/**
 * Primitive JSON-serializable value.
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * Standard recursive JSON value.
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

/**
 * Unique, stable identifier for a node within a document.
 */
export type NodeId = string;

/**
 * Individual content or layout node in the document hierarchy.
 */
export interface IRichNode {
  /**
   * Unique and stable node ID across moves, reorders, and edits.
   */
  id: NodeId;

  /**
   * Identifier mapping to a registered component in the ComponentRegistry.
   * Example: 'Hero', 'Section', 'Heading', 'Grid', 'RichText'
   */
  type: string;

  /**
   * Plain JSON-serializable properties passed to the component renderer.
   */
  props: Record<string, JSONValue>;

  /**
   * Default children for linear/single-zone containers.
   */
  children?: IRichNode[];

  /**
   * Named multi-zone slots for complex layout components (e.g. 'left', 'right', 'header').
   */
  slots?: Record<string, IRichNode[]>;

  /**
   * Non-rendered node metadata (e.g., collapsed state in layers panel, locked status).
   */
  meta?: Record<string, JSONValue>;
}

/**
 * Root canonical document.
 */
export interface IRichDocument {
  /**
   * Document schema version for migrations (SemVer string, e.g. "1.0.0").
   */
  version: string;

  /**
   * Root node of the document tree (always of type 'root' or top-level container).
   */
  root: IRichNode;

  /**
   * Document-level metadata (e.g., title, SEO tags, canvas background color, author).
   */
  metadata?: Record<string, JSONValue>;
}
```

---

## 2. Slots & Children Architecture

Visual page builders require both single-column nesting (e.g., adding paragraphs inside a section) and multi-column/named-slot nesting (e.g., putting elements into the `leftColumn` or `rightColumn` of a Split-Layout).

### Unification Model

1. **Default Container**: When a component accepts a single list of children, it populates `node.children`.
2. **Multi-Slot Layout**: When a component specifies named drop zones, it populates `node.slots`:
   ```json
   {
     "id": "card-1",
     "type": "Card",
     "props": { "variant": "elevated" },
     "slots": {
       "header": [
         { "id": "heading-1", "type": "Heading", "props": { "text": "Card Title", "level": 2 } }
       ],
       "body": [
         { "id": "text-1", "type": "Paragraph", "props": { "content": "Card body description." } }
       ],
       "actions": [
         { "id": "btn-1", "type": "Button", "props": { "label": "Learn More", "href": "/about" } }
       ]
     }
   }
   ```
3. **Engine Normalization**: The core engine treats `children` as an alias for the `slots.default` slot, guaranteeing uniform internal traversal algorithms.

---

## 3. Document Tree Invariants

The `@irich/core` engine enforces the following strict structural invariants at all times. Any transaction that violates an invariant is rejected and rolled back.

```
+-----------------------------------------------------------------------------------------+
|                                DOCUMENT INVARIANTS                                      |
+----+------------------------------------------------------------------------------------+
| 1  | Global ID Uniqueness: Every NodeId in the tree must be unique.                     |
| 2  | Root Singularity: Exactly one Root Node exists at the top of the hierarchy.        |
| 3  | Acyclic Structure: No node can be an ancestor of itself (zero circular references).|
| 4  | Valid Move Target: A node cannot be moved into any of its own descendants.          |
| 5  | Type Registration: Every node.type must exist in the ComponentRegistry.            |
| 6  | Strict JSON Value: No functions, undefined, Symbols, DOM elements, or classes.     |
| 7  | Slot Conformance: Nodes placed into slots must adhere to slot schema constraints.  |
| 8  | Pure Immutability: Mutating a node produces a new document reference via structural|
|    | sharing; untouched sibling subtrees preserve referential equality.                 |
+----+------------------------------------------------------------------------------------+
```

### Invariant Validation Rules

```typescript
export interface InvariantValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDocumentInvariants(doc: IRichDocument): InvariantValidationResult {
  const seenIds = new Set<string>();
  const errors: string[] = [];

  function traverse(node: IRichNode, path: string[]) {
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Invalid or missing ID at path ${path.join('.')}`);
    } else if (seenIds.has(node.id)) {
      errors.push(`Duplicate NodeId detected: "${node.id}" at path ${path.join('.')}`);
    } else {
      seenIds.add(node.id);
    }

    // Validate default children
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        traverse(node.children[i], [...path, `children[${i}]`]);
      }
    }

    // Validate named slots
    if (node.slots) {
      for (const [slotName, slotNodes] of Object.entries(node.slots)) {
        for (let i = 0; i < slotNodes.length; i++) {
          traverse(slotNodes[i], [...path, `slots.${slotName}[${i}]`]);
        }
      }
    }
  }

  traverse(doc.root, ['root']);
  return { valid: errors.length === 0, errors };
}
```

---

## 4. State Transitions & Transaction Pipeline

Document mutations are never applied in-place. All changes pass through a **Transaction Pipeline** that produces an atomic, immutable state transition accompanied by a transaction record.

```typescript
export interface EditorTransaction {
  /**
   * Unique transaction timestamp (Unix epoch milliseconds).
   */
  timestamp: number;

  /**
   * The command that triggered this transaction.
   */
  command: string;

  /**
   * Inverse command / state patch used for atomic Undo operations.
   */
  inversePatches: DocumentPatch[];

  /**
   * Forward state patch used for atomic Redo and Remote Sync operations.
   */
  forwardPatches: DocumentPatch[];

  /**
   * Transaction origin: 'local' (user interaction), 'plugin', or 'remote' (collaboration).
   */
  origin: 'local' | 'plugin' | 'remote';
}

export interface DocumentPatch {
  op: 'add' | 'remove' | 'replace' | 'move';
  path: string;
  value?: JSONValue | IRichNode;
}
```

---

## 5. Document Schema Migrations

As component libraries and iRich features evolve, stored document JSON payloads require deterministic migrations between schema versions.

### Migration Architecture

```typescript
export type MigrationFunction = (doc: Record<string, unknown>) => Record<string, unknown>;

export interface MigrationRegistry {
  registerMigration(fromVersion: string, toVersion: string, migration: MigrationFunction): void;
  migrateDocument(doc: Record<string, unknown>, targetVersion: string): IRichDocument;
}
```

- When loading a document, if `doc.version < CURRENT_VERSION`, the engine runs sequential migrations: `v1.0.0 -> v1.1.0 -> v2.0.0`.
- Migrations run headless in `@irich/core` before the document is mounted into the editor or renderer.
