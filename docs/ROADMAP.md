# iRich Roadmap & Architectural Decisions

> Implementation roadmap, phased milestones, and deep architectural trade-off analyses for **iRich**.

---

## 1. Phased Development Roadmap

```
+------------------------------------------------------------------------------------------------+
| PHASE 1: CORE FOUNDATIONS & HEADLESS ENGINE                                                   |
| - Finalize @irich/core JSON schema, NodeId generator, and tree traversal algorithms.            |
| - Implement Command Dispatcher, Transaction Pipeline, and Invariant Validator.                 |
| - Implement Component Registry contract with prop schemas and default values.                  |
| - Build @irich/renderer standalone compiler and React view mapper (<IRichRenderer />).        |
| - 100% test coverage for core mutations, state transitions, and migrations.                    |
+------------------------------------------------------------------------------------------------+
                                                |
                                                v
+------------------------------------------------------------------------------------------------+
| PHASE 2: VISUAL CANVAS & REACT WORKSPACE                                                      |
| - Build @irich/react Context Provider (<IRichProvider />) and useIRich / useNode hooks.         |
| - Implement Visual Canvas with hover outlines, active selection boxes, and breadcrumbs.       |
| - Build Drag-and-Drop visual reordering, slot detection, and insertion indicators.            |
| - Build @irich/ui Property Inspector with field controls (text, number, select, boolean, color).|
| - Implement linear Undo / Redo history journal.                                               |
+------------------------------------------------------------------------------------------------+
                                                |
                                                v
+------------------------------------------------------------------------------------------------+
| PHASE 3: RICH TEXT ENGINE & TYPOGRAPHY INTEGRATION                                            |
| - Develop @irich/rich-text inline text model, marks (bold, italic, code, link), and spans.     |
| - Build seamless inline text editing inside arbitrary block nodes without canvas conflict.    |
| - Implement floating formatting bubble toolbar and slash command menu for blocks.             |
| - Support Markdown shortcut expansion (`# `, `* `, `> `).                                     |
+------------------------------------------------------------------------------------------------+
                                                |
                                                v
+------------------------------------------------------------------------------------------------+
| PHASE 4: PLUGIN ECOSYSTEM & WORKFLOW EXTENSIONS                                               |
| - Implement @irich/plugin-sdk middleware pipeline (`beforeCommand` / `afterCommand`).          |
| - Build AutoSave, History, and Media Upload plugins.                                          |
| - Implement Clipboard Copy / Paste interchange (`application/x-irich-node+json`).             |
| - Build Responsive Breakpoints prop override inspector (Desktop, Tablet, Mobile).             |
| - Schema migration runner for automated document version upgrades.                             |
+------------------------------------------------------------------------------------------------+
                                                |
                                                v
+------------------------------------------------------------------------------------------------+
| PHASE 5: ENTERPRISE, COLLABORATION & AI                                                       |
| - Real-time Multi-user Collaboration adapter using Yjs CRDT and WebRTC/WebSocket providers.  |
| - AI Assistant Plugin for conversational block generation and content rewriting.               |
| - Headless CMS export adapters (HTML, Clean JSON, AST, Next.js static generation).             |
+------------------------------------------------------------------------------------------------+
```

---

## 2. Architectural Trade-Off Analysis & Recommendations

Where multiple reasonable technical approaches exist, we have evaluated the trade-offs and established concrete architectural decisions:

### Decision 1: Document Tree Structure (Recursive Tree vs. Flat Normalized Map)

- **Option A (Recursive Tree)**: `IRichNode` contains nested `children?: IRichNode[]` and `slots?: Record<string, IRichNode[]>`.
- **Option B (Flat Normalized Map)**: Document stores a dictionary `Record<NodeId, IRichNode>` where each node references child IDs.

> **Recommendation: Option A (Recursive Tree with internal path indexing)**
>
> **Rationale**:
>
> 1. Serialized JSON mirrors standard DOM/JSX hierarchy, making it intuitive to read, store in databases, and inspect.
> 2. Zero translation layer required for standalone SSR rendering (`@irich/renderer` directly walks the tree).
> 3. For editor operations requiring fast O(1) lookups, the editor instance maintains a transient internal WeakMap/index of `NodeId -> path` that updates during transactions, combining the storage simplicity of recursive trees with the performance of flat maps.

---

### Decision 2: State Management & Reactivity in React (`useSyncExternalStore` vs. Zustand/Jotai)

- **Option A (Third-Party State Store e.g. Zustand)**: Bundle an external store library inside `@irich/react`.
- **Option B (Native Event Emitter + `useSyncExternalStore`)**: Native TypeScript event emitter in `@irich/core` connected to React via `React.useSyncExternalStore`.

> **Recommendation: Option B (`useSyncExternalStore` with fine-grained selectors)**
>
> **Rationale**:
>
> 1. Keeps `@irich/core` 100% dependency-free and lightweight.
> 2. `useSyncExternalStore` is React's official, concurrent-mode safe primitive for subscribing to external state machines.
> 3. Guarantees zero tearing and allows granular node subscriptions (`useNode(id)`) so editing a single property never re-renders unrelated visual blocks.

---

### Decision 3: Drag-and-Drop Engine (`@dnd-kit` vs. Native HTML5 DnD vs. Custom PointerEvents)

- **Option A (HTML5 Native Drag and Drop)**: Use browser `dragstart` / `dragover` / `drop` APIs.
- **Option B (`@dnd-kit`)**: Modular modern React drag-and-drop library based on PointerEvents.
- **Option C (Custom PointerEvent engine from scratch)**: Custom mouse/touch event listeners.

> **Recommendation: Option B (`@dnd-kit` in `@irich/react`)**
>
> **Rationale**:
>
> 1. HTML5 native drag-and-drop has severe styling limitations, inconsistent touch support on mobile/tablets, and glitchy drag preview customization.
> 2. `@dnd-kit` is lightweight, accessible, supports collision detection algorithms (crucial for nested dropzones and multi-column slots), and isolates all DOM measurement inside React without polluting `@irich/core`.

---

### Decision 4: Inline Rich-Text Engine (Native ContentEditable vs. Embedded ProseMirror/Tiptap Model vs. Custom Span AST)

- **Option A (Custom Span AST)**: Array of `{ text: string, marks: string[] }` managed by custom input handlers.
- **Option B (Dedicated Headless ProseMirror/Tiptap Instance per text block)**: Mount a lightweight ProseMirror state inside rich text nodes.
- **Option C (Native `contentEditable` with DOM input events)**: Minimal contentEditable wrapper.

> **Recommendation: Hybrid Approach (Phase 1: Pure Span AST; Phase 3: Headless ProseMirror Bridge via `@irich/rich-text`)**
>
> **Rationale**:
>
> 1. For Phase 1 & 2, simple text props with standard inputs suffice for page building.
> 2. For Phase 3, bridging inline text nodes to headless ProseMirror transactions inside `@irich/rich-text` delivers industrial-grade cursor management, multi-line formatting, and IME (Japanese/Chinese) keyboard compatibility without burdening `@irich/core`.

---

### Decision 5: Real-Time Multi-User Collaboration (Operational Transformation vs. Yjs CRDT)

- **Option A (Operational Transformation / OT)**: Centralized server resolving transaction deltas (like Google Docs).
- **Option B (CRDT via Yjs)**: Decentralized Conflict-free Replicated Data Type.

> **Recommendation: Option B (Yjs CRDT via Plugin Extension in Phase 5)**
>
> **Rationale**:
>
> 1. Yjs is the industry standard for collaborative editing in modern web applications.
> 2. Works peer-to-peer (WebRTC) or client-server (WebSocket, Cloudflare Durable Objects).
> 3. Does not require a specialized backend OT engine; `@irich/core`'s deterministic patch format maps directly to Yjs `Y.Doc` shared types.
