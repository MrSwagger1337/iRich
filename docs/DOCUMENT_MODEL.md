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
 * Text and layout direction.
 */
export type IRichDirection = 'ltr' | 'rtl' | 'auto';

/**
 * Document-level structural metadata.
 */
export interface IRichDocumentMetadata {
  locale?: string;
  direction?: IRichDirection;
  [key: string]: JSONValue | undefined;
}

/**
 * Node-level structural metadata.
 */
export interface IRichNodeMeta {
  dir?: IRichDirection;
  lang?: string;
  [key: string]: JSONValue | undefined;
}

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
   * Non-rendered node structural metadata (e.g., dir, lang, locked status).
   */
  meta?: IRichNodeMeta;
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
   * Document-level metadata (e.g., locale, direction, title, author).
   */
  metadata?: IRichDocumentMetadata;
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

---

## 6. Headless JSON Round-Trip & Diagnostics Engine

`@irich/core` provides pure headless utilities to parse, validate, and format documents for headless CMS storage and external AI workflows (`Export JSON -> External AI transform -> Paste JSON -> Atomic Apply`).

### Utilities

```typescript
import {
  parseDocumentJSON,
  validateDocumentJSON,
  formatDocumentJSON,
} from '@irich/core';

// Safe parsing (catches syntax errors and wraps them in structured diagnostics)
const parseResult = parseDocumentJSON(rawJsonString);

// Comprehensive invariant, component, placement, schema, and security validation
const validationResult = validateDocumentJSON(rawJsonStringOrObject, registry);

// Deterministic 2-space indented formatting suitable for AI prompts and version control
const formattedJson = formatDocumentJSON(doc);
```

### Structured Diagnostic Model

Validation diagnostics provide machine-readable error codes and rich contextual metadata so UI components (e.g., error modals) can highlight exact problem locations without string parsing.

```typescript
export type ValidationErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_DOCUMENT_VERSION'
  | 'INVALID_ROOT'
  | 'INVALID_NODE_ID'
  | 'DUPLICATE_NODE_ID'
  | 'UNKNOWN_COMPONENT'
  | 'INVALID_PROP'
  | 'INVALID_PLACEMENT'
  | 'INVALID_DIRECTION'
  | 'UNSAFE_VALUE';

export interface ValidationErrorDetail {
  code: ValidationErrorCode;
  message: string;
  path?: string;
  nodeId?: string;
  nodeType?: string;
  propName?: string;
}

export interface DocumentValidationResult {
  valid: boolean;
  errors: string[];
  diagnostics: ValidationErrorDetail[];
}
```

---

## 7. Package Validation Boundaries

To preserve strict architectural isolation:
- `@irich/core` **MUST NOT** import or depend on `@irich/rich-text`, Tiptap, or ProseMirror.
- RichText content trees stored inside node `props` are validated by `@irich/core` for pure JSON-serializability and prototype safety.
- Deep domain-specific validation of RichText AST structures is delegated to custom prop validators registered with the `ComponentRegistry` via `ComponentDefinition.props[field].validate`.

---

## 8. Canonical Document Example (Arabic RTL with English LTR Override)

The canonical document below demonstrates document-level Arabic (`ar`) metadata with RTL direction, containing an editorial callout node overriding direction to `ltr` and language to `en`:

```json
{
  "version": "1.0.0",
  "metadata": {
    "locale": "ar",
    "direction": "rtl",
    "title": "مقدمة إلى الذكاء الاصطناعي التوليدي",
    "author": "فريق التحرير"
  },
  "root": {
    "id": "root",
    "type": "root",
    "props": {},
    "children": [
      {
        "id": "heading-1",
        "type": "Heading",
        "props": {
          "level": 1,
          "content": "الذكاء الاصطناعي ومستقبل النشر الرقمي"
        }
      },
      {
        "id": "paragraph-1",
        "type": "Paragraph",
        "props": {
          "content": "تتيح النظم الحديثة كتابة وتنسيق المقالات بمرونة غير مسبوقة، بما يدعم اللغات متعددة الاتجاهات."
        }
      },
      {
        "id": "callout-english-quote",
        "type": "Callout",
        "props": {
          "variant": "quote",
          "title": "Technical Quote"
        },
        "meta": {
          "dir": "ltr",
          "lang": "en"
        },
        "children": [
          {
            "id": "paragraph-en-1",
            "type": "Paragraph",
            "props": {
              "content": "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra"
            }
          }
        ]
      },
      {
        "id": "paragraph-2",
        "type": "Paragraph",
        "props": {
          "content": "نستنتج من ذلك أن وضوح البنية التحتية هو الأساس لأي نظام برمجي ناجح."
        }
      }
    ]
  }
}
```

---

## 9. Multilingual, Direction & Language Architecture


iRich provides first-class support for multilingual, bidirectional (Bidi), and right-to-left (RTL) content (Arabic, English, French, Dutch, etc.).

### 9.1 Direction & Language Resolution Precedence

To support seamless embedding inside both LTR and RTL host applications, `@irich/renderer` follows strict semantic inheritance rules without forcing an arbitrary `'ltr'` fallback:

#### Direction Precedence
1. **Explicit Renderer Prop**: `props.direction` passed to `<IRichRenderer direction="..." />`
2. **Document Metadata**: `document.metadata.direction` (`'ltr' | 'rtl' | 'auto'`)
3. **Semantic Host Inheritance**: `undefined` -> No `dir` attribute is emitted on the root container, allowing natural inheritance from the surrounding host DOM.

#### Language Precedence
1. **Explicit Renderer Prop**: `props.lang` passed to `<IRichRenderer lang="..." />`
2. **Document Metadata**: `document.metadata.locale` (e.g. `'ar'`, `'en-US'`, `'fr'`)
3. **Semantic Host Inheritance**: `undefined` -> No `lang` attribute is emitted on the root container, allowing natural inheritance from the surrounding host DOM.

### 9.2 Node-Level Direction & Language Overrides

Individual nodes can declare localized direction and language overrides in `node.meta`:

```json
{
  "id": "quote-english",
  "type": "Quote",
  "props": { "quote": "Simplicity is prerequisite for reliability." },
  "meta": {
    "dir": "ltr",
    "lang": "en"
  }
}
```

- Node-level direction and language are passed directly into the registered component renderer via `NodeRendererProps`:
  ```typescript
  export interface NodeRendererProps<TProps = Record<string, JSONValue>> {
    node: IRichNode;
    props: TProps;
    dir?: IRichDirection;
    lang?: string;
    // ...
  }
  ```
- Component authors attach these props directly to their real semantic HTML tags (`<blockquote dir={dir} lang={lang}>`).
- **No `display: contents` wrapper**: iRich does NOT wrap nodes in synthetic `<div style={{ display: 'contents' }}>` elements, avoiding accessibility tree destruction, drag-and-drop bounding rect calculation failures, and event-targeting discrepancies.

### 9.3 Independent UI Chrome Direction vs Document Direction

- **Document Content Direction**: `IRichDirection = 'ltr' | 'rtl' | 'auto'`
- **Editor UI Direction**: `IRichUIDirection = 'ltr' | 'rtl'` (strictly binary; `'auto'` is not used for editor chrome).
- Editor studio chrome (toolbar, palette, inspector) and visual canvas operate independently, enabling:
  - UI: LTR & Document: RTL (e.g., English CMS authoring Arabic article)
  - UI: RTL & Document: RTL (e.g., native Arabic CMS authoring Arabic article)
  - UI: RTL & Document: LTR (e.g., native Arabic CMS authoring English article)


