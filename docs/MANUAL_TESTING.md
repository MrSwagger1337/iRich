# iRich v0.1.0 Human Testing & Dogfooding Manual

> **Purpose**: This checklist guides human manual verification and dogfood testing for **iRich v0.1.0**. Automated unit and build tests verify code contracts, but manual human testing is essential to discover visual regressions, ergonomic friction, focus traps, and real-world UX issues.
>
> **Instruction for Tester**: Work through each section sequentially. Do not mark tests as passed until you have verified the expected behavior in your browser. Record any observations or UX bugs in the `Notes` field.

---

## Quick Start: Development Servers

Use these root scripts to launch each application independently:

| Target Application | Command | Local URL |
| :--- | :--- | :--- |
| **Interactive Playground** | `pnpm dev:playground` | `http://localhost:3000` |
| **Documentation Portal** | `pnpm dev:docs` | `http://localhost:3001` |
| **Next.js Example App** | `pnpm dev:nextjs-example` | `http://localhost:3002` |
| **React + Vite Example** | `pnpm dev:vite-example` | `http://localhost:5173` |

---

## Manual Test Checklist

### 1. Playground Startup
- **Steps**:
  1. Open terminal in workspace root and run `pnpm dev:playground`.
  2. Open `http://localhost:3000` in a modern browser (Chrome, Firefox, Edge, or Safari).
- **Expected Result**: Server starts without compilation errors; page loads cleanly without Next.js crash overlay or server errors.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 2. Editor Loading
- **Steps**:
  1. Observe the loaded playground interface at `http://localhost:3000`.
- **Expected Result**: Top toolbar, left component palette (or drawer), central canvas area, and right property inspector load in their default positions without flickering or layout shifts.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 3. Component Palette
- **Steps**:
  1. Review the component items listed in the palette panel.
  2. Verify that all standard components are present (e.g., Hero, Heading, Paragraph, Card, Container, Button, RichText).
- **Expected Result**: Component items display clear labels, category headings, and drag handles or click-to-add affordances.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 4. Adding Components
- **Steps**:
  1. Click or drag a component (e.g. `Heading` or `Hero`) from the palette onto the canvas.
- **Expected Result**: A new node is inserted into the document tree and immediately rendered on the canvas with its default props.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 5. Selecting Components
- **Steps**:
  1. Click on an existing component on the canvas.
  2. Click on empty canvas space or another component.
- **Expected Result**: The clicked component receives a distinct visual selection outline or highlight. Clicking outside deselects; clicking another switches selection.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 6. Property Inspector
- **Steps**:
  1. Select a component on the canvas (e.g. `Hero` or `Heading`).
  2. Observe the right-side inspector sidebar.
- **Expected Result**: Inspector populates with controls corresponding to the component's registered fields (text inputs, selects, toggles, colors). No blank or frozen states.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 7. Editing Text Fields
- **Steps**:
  1. Select a node with a text prop.
  2. In the inspector, edit the text input value (e.g. type `"Custom Heading Text"`).
- **Expected Result**: The canvas updates reactively and smoothly without losing input focus or cursor position.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 8. Drag and Drop
- **Steps**:
  1. Drag a component from the palette and hover over the canvas.
  2. Observe drop indicator lines or insertion highlights.
  3. Release the mouse button to drop.
- **Expected Result**: Drop indicator displays the exact insertion position. The node is inserted at the highlighted location without jumping or ghost overlays.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 9. Nested Components
- **Steps**:
  1. Insert a `Container` or `Card` component.
  2. Drag another component (e.g. `Button` or `Heading`) inside the container.
- **Expected Result**: The inner component becomes a child of the container in the document tree and renders nested within its visual boundaries.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 10. Reordering Components
- **Steps**:
  1. Add 3 sequential components on the canvas.
  2. Drag the bottom component and drop it above the top component.
- **Expected Result**: The component order updates visually on the canvas and in the document tree order.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 11. Undo
- **Steps**:
  1. Perform an action (e.g. edit a text field or add a component).
  2. Click the **Undo** button in the toolbar (or press `Cmd/Ctrl + Z`).
- **Expected Result**: The state reverts to the exact state prior to the action.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 12. Redo
- **Steps**:
  1. After performing an Undo, click the **Redo** button in the toolbar (or press `Cmd/Ctrl + Shift + Z` / `Ctrl + Y`).
- **Expected Result**: The undone action is re-applied cleanly.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 13. Duplicate
- **Steps**:
  1. Select a component on the canvas.
  2. Click **Duplicate** or press `Cmd/Ctrl + D`.
- **Expected Result**: An exact duplicate is inserted adjacent to the original node with identical props and children, but with a fresh unique `id`.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 14. Copy / Paste
- **Steps**:
  1. Select a node on the canvas and press `Cmd/Ctrl + C`.
  2. Select another container or root, and press `Cmd/Ctrl + V`.
- **Expected Result**: The copied node and all its descendants are pasted with fresh IDs. The clipboard does not conflict when copying text inside an input field.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 15. Delete
- **Steps**:
  1. Select a node on the canvas.
  2. Press `Delete` or `Backspace` (while not focused in a text input field).
- **Expected Result**: The node is removed from the canvas and document tree. Selection is cleared or moves to an adjacent node.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 16. Rich-Text Editing
- **Steps**:
  1. Add or select a `RichText` component on the canvas.
  2. Click inside the editable rich-text area and type formatted paragraphs.
- **Expected Result**: Caret moves naturally, text wraps correctly, and content edits are captured in the rich text document structure.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 17. Rich-Text Toolbar
- **Steps**:
  1. Highlight a span of text inside the rich-text editor.
  2. Use the floating toolbar or formatting buttons to apply **Bold**, *Italic*, Underline, or Heading level.
- **Expected Result**: The mark/format is applied strictly to the selected text span without breaking the surrounding document.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 18. Responsive Desktop / Tablet / Mobile Modes
- **Steps**:
  1. In the editor toolbar, toggle between **Desktop**, **Tablet**, and **Mobile** viewport icons.
  2. Switch to Mobile mode, select a responsive field (e.g. font size or padding), and edit its value.
  3. Switch back to Desktop mode.
- **Expected Result**: Canvas frame resizes to appropriate breakpoint dimensions. The Mobile override is preserved without overwriting or destroying the Desktop base value.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 19. Saving / Loading Document JSON
- **Steps**:
  1. Click **Export JSON** or **Save** in the playground.
  2. Copy or inspect the exported JSON.
  3. Modify or reset the canvas, then paste the exported JSON and click **Load**.
- **Expected Result**: The exported document is valid plain JSON. Loading it reconstructs the exact document structure and component props.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 20. Renderer Output (Preview / Published Mode)
- **Steps**:
  1. Toggle to **Preview** mode in the playground or observe the standalone renderer view.
- **Expected Result**: Document renders cleanly using `@irich/renderer` without editor selection boxes, handles, sidebars, or drag outlines.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 21. Browser Refresh Behavior
- **Steps**:
  1. Make edits in the editor (where autosave or local storage is enabled).
  2. Refresh the browser page (`F5` or `Cmd/Ctrl + R`).
- **Expected Result**: Document state rehydrates from storage without data loss, React hydration mismatch errors, or state corruption.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 22. Keyboard Shortcuts
- **Steps**:
  1. Test shortcuts while on canvas: `Cmd/Ctrl + Z` (Undo), `Cmd/Ctrl + Shift + Z` (Redo), `Cmd/Ctrl + C` (Copy), `Cmd/Ctrl + V` (Paste), `Cmd/Ctrl + D` (Duplicate), `Delete` (Delete).
  2. Click inside an inspector input field and test `Cmd/Ctrl + C`, `Cmd/Ctrl + V`, `Backspace`.
- **Expected Result**: Canvas shortcuts operate when canvas is active. When focused inside text inputs, native browser text selection/clipboard/backspace behavior is preserved.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 23. Error States & Unknown Components
- **Steps**:
  1. Load a document containing an unregistered component type (e.g. `"type": "UnknownWidget"`).
- **Expected Result**: The editor and renderer display a graceful fallback error placeholder rather than crashing or throwing unhandled React exceptions.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 24. Documentation Navigation
- **Steps**:
  1. Run `pnpm dev:docs` and open `http://localhost:3001`.
  2. Navigate through sidebar categories: *Getting Started*, *Core Concepts*, *Visual Editor*, *Advanced*, and *API Reference*.
- **Expected Result**: All 28+ documentation pages load smoothly with proper heading hierarchy, breadcrumbs, and active navigation highlights.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 25. Documentation Code Examples
- **Steps**:
  1. Inspect code snippets across the docs (Quick Start, Custom Components, Renderer).
  2. Copy and review sample code for syntax accuracy.
- **Expected Result**: Syntax highlighting renders cleanly; code examples accurately represent `@irich/*` public APIs with no deprecated or fictional functions.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 26. Next.js Example App
- **Steps**:
  1. Run `pnpm dev:nextjs-example` and open `http://localhost:3002`.
  2. Test both the published page (SSR renderer at `/`) and the visual editor route at `/editor`.
- **Expected Result**: SSR route renders semantic HTML from JSON with zero client warnings; `/editor` route allows visual authoring inside Next.js App Router.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 27. React + Vite Example App
- **Steps**:
  1. Run `pnpm dev:vite-example` and open `http://localhost:5173`.
  2. Test adding components, changing properties, and previewing output.
- **Expected Result**: Vite SPA starts instantly; Hot Module Replacement (HMR) and editor state work smoothly without Next.js dependencies.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 28. Browser Console Errors
- **Steps**:
  1. Open Browser DevTools (`F12` -> Console tab) across Playground, Docs, Next.js, and Vite apps.
- **Expected Result**: No unhandled exceptions, React key errors, hydration warnings, or unhandled promise rejections.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 29. Accessibility & Keyboard Smoke Test
- **Steps**:
  1. Navigate the editor using only the keyboard (`Tab`, `Shift + Tab`, `Enter`, `Space`, arrow keys).
- **Expected Result**: Focus rings are visible on interactive elements, buttons are keyboard-activatable, and toolbar items announce appropriate ARIA roles.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

### 30. Visual Layout Issues
- **Steps**:
  1. Resize the browser window to various sizes and test dark/light themes if supported.
- **Expected Result**: No overflowing text, clipped sidebars, broken z-index overlays, or unusable inspector panes.
- **Verification**:
  - [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Notes**: 

---

## REAL PAGE TEST

> **Objective**: Build a realistic landing page in the iRich visual editor, save the document, reload it, and inspect the output with the standalone production renderer.

### Step-by-Step Scenario

1. **Launch Playground**: Run `pnpm dev:playground` and open `http://localhost:3000`.
2. **Clear Canvas**: Start from a blank document or reset existing content.
3. **Hero Section**:
   - Add a `Hero` component.
   - Set title: `"Build Modern Web Experiences Faster"`.
   - Set subtitle: `"The embeddable, extensible visual editor for modern React applications."`.
   - Set background color or style.
4. **Heading & Introduction**:
   - Add a `Heading` (`"Why Developers Choose iRich"`).
   - Add a `RichText` block with formatted text (paragraphs with **bold**, *italic*, and a bulleted list).
5. **Feature Cards (Nested Containers)**:
   - Add a 3-column `Container` or grid.
   - Insert 3 `FeatureCard` or `Card` components inside the container.
   - Populate each card with an icon/title, description text, and a `Button`.
6. **Call to Action (CTA)**:
   - Add a `CTA` banner at the bottom with a primary button `"Get Started Now"`.
7. **Responsive Overrides**:
   - Switch to **Tablet** viewport: Adjust container padding and heading size.
   - Switch to **Mobile** viewport: Set heading size smaller and change card layout to stacked.
   - Switch back to **Desktop**: Confirm base desktop styles remain intact.
8. **Save Document**:
   - Click **Save / Export JSON** and copy the exported JSON string.
9. **Reload & Restore**:
   - Refresh the browser page (`F5`).
   - Import/load the saved JSON.
   - Verify all components, text, card hierarchies, and responsive overrides restore identically.
10. **Render in Production Renderer**:
    - Switch to **Preview** or load the JSON into the Next.js published page (`http://localhost:3002`).
    - Verify that the rendered page looks identical to the edited design, renders pure semantic HTML, and contains zero editor controls or inspector artifacts.

### Real Page Test Result

- **Visual Quality**: [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Data Integrity**: [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Responsive Behavior**: [ ] PASS &nbsp;&nbsp; [ ] FAIL
- **Renderer Parity**: [ ] PASS &nbsp;&nbsp; [ ] FAIL

**Tester Feedback & Ergonomic Observations**:
```
(Record notes on ease of use, drag responsiveness, inspector clarity, or friction points here)
```
