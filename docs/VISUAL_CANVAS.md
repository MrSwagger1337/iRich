# Visual Canvas & Drag-and-Drop Architecture

> Reference and integration guide for the reusable visual canvas subsystem in `@irich/react`.

---

## 1. Subsystem Purpose & Overview

The visual canvas (`@irich/react`) bridges structured document state (`@irich/core`) with interactive visual layout editing in React.

Prior to Phase 4, interactive canvas logic was duplicated across application packages (`examples/nextjs-basic` and `apps/playground`). With Phase 4, all interactive canvas mechanics are consolidated into reusable primitives exported from `@irich/react`:

- **`<IRichCanvas />`**: The top-level responsive canvas component with recursive node tree rendering, background deselect, empty container slots, and root append drop zone.
- **`<IRichCanvasNode />`**: The interactive node wrapper handling selection state, hover outlines, drop hit testing, drop indicators, and drag handles.
- **`<IRichNodeActionBar />` & `useIRichNodeActions()`**: Floating action toolbar providing move up/down, duplicate, delete, and dedicated drag handle grip.
- **`<IRichPaletteItem />` & `useIRichPaletteDraggable()`**: Component palette primitives for drag-to-insert and click-to-insert workflows.

```
@irich/core (Framework-Independent State & Commands)
       │
       ▼
@irich/react/canvas (Reusable Visual Canvas & DnD)
 ├── <IRichCanvas />
 ├── <IRichCanvasNode />
 ├── <IRichNodeActionBar />
 ├── <IRichPaletteItem />
 └── useIRichNodeActions()
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
 apps/playground       examples/nextjs-basic      Custom Consumer Apps
```

---

## 2. Interaction Contract & Drag Handle Isolation

### Amendment 1: Intentional Drag Handle

To eliminate conflicts with rich text selection, inline formatting, links, buttons, and nested inputs, **the node body is NOT draggable** (`draggable={false}`).

- **Node Body**: Click to select node, interact with component controls, or double-click to edit rich text.
- **Drag Handle**: Drag initiates **strictly** from the dedicated drag handle (`[data-irich-drag-handle="true"]`) mounted on `<IRichNodeActionBar />`.
- **Palette Items**: May be dragged directly for component insertion.

### Amendment 3: DataTransfer MIME Type Isolation

Internal drag operations use dedicated, private MIME types:

- Palette Drag: `application/x-irich-palette-type`
- Node Move Drag: `application/x-irich-node-id`

`text/plain` fallback payloads are **deliberately omitted** to prevent accidental text drops into prose editors, textareas, inputs, or external operating system windows.

---

## 3. Drop Geometry & Placement Semantics

### Semantic Drop Model

The visual canvas calculates insertion intent using 4 semantic targets:

1. `'before'`: Insert preceding the hovered node.
2. `'after'`: Insert succeeding the hovered node.
3. `'inside'`: Nest as a child inside the hovered container node.
4. `'root'`: Append to the root document.

### Private Geometry Thresholds (Amendment 4)

Thresholds are kept as private internal constants:
- **Containers**: Top 18% triggers `'before'`, bottom 18% triggers `'after'`, middle 64% triggers `'inside'`.
- **Leaf Nodes**: Top 50% triggers `'before'`, bottom 50% triggers `'after'`.

### Move & Nesting Invariants (Amendment 6 & 8)

1. **Cycle Prevention**: Ancestor nodes cannot be dropped into their own descendant subtrees (`isDescendantOf` validation).
2. **maxChildren Move Semantics**: Reordering or moving an existing node within a container at `maxChildren` capacity is permitted because child count does not increase.
3. **Atomic 1-Step Undo**: Drag operations dispatch single core commands (`insertNode`, `moveNode`), preserving exact 1-step undo/redo transactions without composite side-effects.

---

## 4. Child-Slot Rendering Contract (Amendment 7)

Containers render child nodes using standard React props:

```tsx
export const ContainerRenderer: ComponentRenderer = ({ children, dir, lang }) => {
  return (
    <div className="container" dir={dir} lang={lang}>
      {children}
    </div>
  );
};
```

When a container has 0 children, `<IRichCanvas />` automatically renders an empty slot drop zone (`data-irich-empty-slot="true"`), allowing intuitive drop-to-nest interactions.

---

## 5. Node Actions Presentation vs. Mechanics (Amendment 2)

Consumers can completely replace or suppress the action toolbar without breaking canvas selection or drag mechanics:

```tsx
// Complete suppression
<IRichCanvas
  components={renderers}
  renderNodeActions={() => null}
/>

// Custom action bar
<IRichCanvas
  components={renderers}
  renderNodeActions={({ nodeType, canDelete, deleteNode, dragHandleProps }) => (
    <div className="custom-actions">
      <span {...dragHandleProps}>⋮⋮</span>
      <span>{nodeType}</span>
      <button onClick={deleteNode} disabled={!canDelete}>Trash</button>
    </div>
  )}
/>
```

---

## 6. Accessibility & Direction Fidelity

- **Keyboard Action Buttons**: Node action bars provide accessible button triggers for `Move Up`, `Move Down`, `Duplicate`, and `Delete`.
- **RTL & Bidi Fidelity**: Respects document-level metadata (`dir="rtl"`) and per-node overrides without forcing LTR fallbacks.
- **Honest DnD Assessment**: HTML5 pointer drag-and-drop is pointer-based; full keyboard reordering is supported via the action bar buttons.
