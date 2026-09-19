# Visual Canvas & DnD Manual Verification Checklist

> Verification protocol for Phase 4 Reusable Visual Canvas & Drag-and-Drop Subsystem.
>
> **Status**: `NOT TESTED BY HUMAN` (Automated tests pass; awaiting owner dogfooding).

---

## 1. Node Selection & Interaction

- [ ] **1.1 Single Click Selection**: Clicking any node selects it and renders selection outlines.
- [ ] **1.2 Backdrop Deselection**: Clicking the canvas backdrop deselects active node.
- [ ] **1.3 Nested Selection**: Clicking a child node inside a Container selects the child without selecting the parent.
- [ ] **1.4 Keyboard Selection**: Focusing a node and pressing `Enter` or `Space` selects it.

---

## 2. Drag Handle Isolation (Amendment 1)

- [ ] **2.1 Node Body Drag Prevention**: Dragging from a node's body or text area does NOT initiate drag.
- [ ] **2.2 Drag Handle Initiation**: Dragging from the dedicated grip handle (`⋮⋮`) initiates node move drag.
- [ ] **2.3 RichText Selection**: Highlighting prose in a RichText node allows normal text selection without triggering drag.
- [ ] **2.4 Button/Link Click**: Clicking buttons or links inside rendered nodes does not initiate node drag.

---

## 3. Component Palette Insertion

- [ ] **3.1 Drag from Palette to Top**: Dragging a component from the palette to the top region of a node inserts it before.
- [ ] **3.2 Drag from Palette to Bottom**: Dragging a component to the bottom region of a node inserts it after.
- [ ] **3.3 Drag from Palette into Container**: Dragging a component into an empty or populated container nests it inside.
- [ ] **3.4 Root Append Drop Zone**: Dragging a component onto the bottom canvas drop zone appends it to the page.
- [ ] **3.5 Palette Click to Insert**: Clicking a palette item inserts it into the currently selected container or root.

---

## 4. Reordering & Moving Nodes

- [ ] **4.1 Reorder Before**: Dragging node A before node B reorders it correctly.
- [ ] **4.2 Reorder After**: Dragging node A after node B reorders it correctly.
- [ ] **4.3 Same-Parent Index Shift**: Moving node A forward or backward within the same parent calculates the correct destination index.
- [ ] **4.4 Nesting into Container**: Dragging a leaf node into a Container moves it inside the container.
- [ ] **4.5 Moving out of Container**: Dragging a child node out of a Container onto the root canvas moves it out.

---

## 5. Drop Indicators & Feedback

- [ ] **5.1 Top Edge Indicator**: Hovering top region renders blue insertion line and "Insert before".
- [ ] **5.2 Bottom Edge Indicator**: Hovering bottom region renders blue insertion line and "Insert after".
- [ ] **5.3 Inside Container Badge**: Hovering middle region of container displays "Drop inside [Container]".
- [ ] **5.4 Empty Container Slot**: Empty container renders discoverable dashed slot.
- [ ] **5.5 Invalid Drop Feedback**: Attempting an invalid drop displays rejected / invalid feedback.

---

## 6. Cycle & Placement Prevention

- [ ] **6.1 Parent into Child Cycle**: Dragging a Container onto one of its own children is rejected.
- [ ] **6.2 Self Drop**: Dragging a node onto itself is ignored.
- [ ] **6.3 maxChildren Move**: Reordering inside a full container at maxChildren capacity succeeds.

---

## 7. Action Bar & Keyboard Controls (Amendment 2)

- [ ] **7.1 Move Up Button**: Clicking Move Up shifts node up by 1 position.
- [ ] **7.2 Move Down Button**: Clicking Move Down shifts node down by 1 position.
- [ ] **7.3 Duplicate Button**: Clicking Duplicate creates an exact copy of the node and selects it.
- [ ] **7.4 Delete Button**: Clicking Delete removes the node from the document.
- [ ] **7.5 Edge Boundary Disabling**: Move Up is disabled on the first child; Move Down is disabled on the last child.

---

## 8. Undo / Redo & Direction Fidelity

- [ ] **8.1 1-Step Undo for Palette Insert**: Inserting from palette and pressing Undo removes the inserted node in 1 step.
- [ ] **8.2 1-Step Undo for Node Move**: Moving a node and pressing Undo restores original location in 1 step.
- [ ] **8.3 RTL Document Canvas**: Arabic/RTL documents render with `dir="rtl"` and proper alignment.
- [ ] **8.4 LTR Overrides**: Embedded English blocks inside RTL documents render with `dir="ltr"`.
