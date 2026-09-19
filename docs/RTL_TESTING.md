# iRich Multilingual & RTL/Bidi Human Testing Checklist

> **Purpose**: This checklist guides human manual verification and dogfood testing for **iRich Phase 2 (Multilingual, RTL/LTR & Bidi Foundation)**. Automated unit tests and builds verify code contracts and AST transformations, but manual human testing is required to verify browser Bidi rendering, optical kerning, cursor navigation, drag-and-drop hit testing, and visual layout alignment across mixed-direction contexts.
>
> **Instruction for Tester**: Work through each section sequentially in a real web browser (Chrome, Firefox, Safari, Edge). Verify expected behavior before marking items.
>
> **Current Status**: All test items below are initialized to **`NOT TESTED BY HUMAN`** pending human physical browser execution.

---

## Testing Environment & Quick Start

Launch the Next.js Example Dogfood Application:

```bash
pnpm dev:nextjs-example
```

- **Published SSR Route**: `http://localhost:3002` (or `http://localhost:3002/?fixture=arabic`)
- **Visual Editor Studio**: `http://localhost:3002/editor`

---

## 32-Item Manual Verification Checklist

### Section 1: Typography & Mixed-Language (Bidi) Text

#### 1. Arabic Script & Font Cascade
- **Steps**: Open `http://localhost:3002/editor`, select the **🇸🇦 Arabic RTL** fixture.
- **Expected Result**: Arabic text renders with proper cursive connections (nastaliq/naskh ligatures), correct line-height, and no clipped descenders or broken glyph connections.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 2. Mixed Bidi Phrases with Latin Abbreviations & Standards
- **Steps**: Inspect paragraph containing: *"تم اعتماد ISO/IEC 42001:2023 كمعيار دولي لإدارة أنظمة الذكاء الاصطناعي."*
- **Expected Result**: "ISO/IEC 42001:2023" renders as a cohesive Latin phrase embedded naturally within the right-to-left Arabic sentence without inverted punctuation or misplaced colons.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 3. Mixed Years, Numbers & Percentages
- **Steps**: Inspect strings containing Arabic text combined with years (2026), percentages (99.9%), and numbers.
- **Expected Result**: Numbers and percentage symbols remain correctly oriented within the Arabic text flow without manual Unicode control hacks.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 4. Inline Formatting in Arabic (Bold, Italic, Code)
- **Steps**: Review bold Arabic text and bold English phrases inside Arabic sentences.
- **Expected Result**: Bold weight applies crisply across script boundaries without misaligning baseline or disrupting word spacing.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 5. Inline Hyperlinks in Bidi Context
- **Steps**: Click and inspect inline links within the Arabic paragraphs.
- **Expected Result**: Link underline and color style render correctly along the Arabic text flow; clicking opens link editor popover at correct position.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 6. Inline Code Spans in RTL
- **Steps**: Inspect inline `<code>` terms (e.g. `createEditor()`, `IRichDocument`) embedded in Arabic text.
- **Expected Result**: Monospace font renders LTR within the RTL paragraph flow with symmetric inline padding.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 2: Block Elements & Logical CSS Properties

#### 7. Unordered Bullet Lists in RTL
- **Steps**: Observe bullet lists in the Arabic fixture.
- **Expected Result**: Bullet markers appear on the right side (`inline-start`), with indentation padding applied on the right (`padding-inline-start: 1.5rem`).
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 8. Ordered Numbered Lists in RTL
- **Steps**: Observe numbered lists (1., 2., 3.) in the Arabic fixture.
- **Expected Result**: List numbers align cleanly on the right margin with correct spacing before the Arabic text content.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 9. Nested Lists Alignment
- **Steps**: Add a sub-item / nested list inside an RTL list.
- **Expected Result**: Sub-items indent progressively towards the left (inline-end) without overflowing or resetting to the left margin.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 10. Blockquote Accent Border (Inline-Start)
- **Steps**: Compare blockquote in English fixture (`border-inline-start` on left) with blockquote in Arabic fixture.
- **Expected Result**: English blockquote has accent bar on the left; Arabic blockquote has accent bar on the right (`border-inline-start: 3px solid var(--accent-primary)`).
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 11. Code Block Direction Semantics
- **Steps**: Inspect `<pre><code>` block in Arabic article fixture.
- **Expected Result**: Programming code blocks default to `dir="ltr"` with left-aligned syntax, while respecting container boundary.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 12. Node-Level Direction Overrides (LTR Quote in RTL Article)
- **Steps**: Inspect the English quote node embedded in the Arabic fixture (`meta.dir: "ltr"`).
- **Expected Result**: English quote renders left-aligned with LTR reading direction and left-side blockquote border, nested seamlessly inside the RTL article.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 3: Editor Chrome & Independent UI Direction

#### 13. UI Direction Independence (UI: LTR + Document: RTL)
- **Steps**: Set **UI: LTR** and load **🇸🇦 Arabic RTL** fixture.
- **Expected Result**: Top toolbar, left palette, and right inspector remain in standard LTR layout, while canvas renders document content strictly in RTL.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 14. UI Direction Independence (UI: RTL + Document: RTL)
- **Steps**: Toggle toolbar button to **UI: RTL** while viewing **🇸🇦 Arabic RTL** fixture.
- **Expected Result**: Entire studio shell flips to RTL (toolbar actions on right, palette on right, inspector on left), perfectly matching Arabic CMS workflow.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 15. UI Direction Independence (UI: RTL + Document: LTR)
- **Steps**: Toggle toolbar button to **UI: RTL** while viewing **🇬🇧 English LTR** fixture.
- **Expected Result**: Studio chrome renders in RTL while the document canvas renders in LTR.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 16. Top Toolbar Layout in RTL UI Mode
- **Steps**: In **UI: RTL** mode, observe the top toolbar.
- **Expected Result**: Navigation link is on right, history buttons flow logically, viewport controls are centered, and utility buttons are on left.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 17. Component Palette Alignment in RTL UI Mode
- **Steps**: In **UI: RTL** mode, inspect the component palette items.
- **Expected Result**: Component icons, category headers, and labels align to the right (`inline-start`).
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 18. Property Inspector Alignment in RTL UI Mode
- **Steps**: In **UI: RTL** mode, select a node and inspect form fields.
- **Expected Result**: Field labels, text inputs, selects, and action buttons align to the right (`inline-start`).
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 4: Interactive Canvas, Selection & Drag-and-Drop

#### 19. Node Selection Outline in RTL
- **Steps**: Click on an Arabic heading, card, or RichText node on the canvas.
- **Expected Result**: Selection bounding box surrounds the node exactly with no horizontal offset or displacement.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 20. Selected Node Action Toolbar Placement
- **Steps**: Select a node in the RTL document canvas.
- **Expected Result**: Floating action toolbar (Duplicate, Delete, Drag Handle) anchors to top-right (`inset-inline-start: 0`) of the selected node.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 21. Drag & Drop Insertion Badges
- **Steps**: Drag a component from palette over an RTL container or card.
- **Expected Result**: Drop target indicators ("Before", "After", "Inside") and drop indicator badges appear at the correct horizontal edge (`inset-inline-end: 1rem`).
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 22. End-of-Canvas Drop Zone
- **Steps**: Drag a component to the bottom drop zone in an RTL document.
- **Expected Result**: Drop zone highlights with dashed accent border and correctly appends node to document root.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 23. RichText Formatting Toolbar in RTL Selection
- **Steps**: Highlight a phrase within an Arabic RichText block.
- **Expected Result**: Formatting bubble toolbar appears above the selection with bold, italic, heading, and link buttons in correct order.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 24. RichText Link Modal Positioning
- **Steps**: Select text in Arabic block, click Link button in bubble toolbar.
- **Expected Result**: Link input popover appears anchored to the inline-start position without getting cut off by the canvas edge.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 5: Responsive Viewports & Editing Ergonomics

#### 25. Viewport Breakpoint Switching in RTL
- **Steps**: Switch between Desktop (1100px), Tablet (768px), and Mobile (375px) on Arabic document.
- **Expected Result**: Canvas frame resizes smoothly; Arabic text wraps cleanly without overflow or horizontal scrollbar glitches.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 26. Cursor Navigation & Arrow Keys in Bidi Text
- **Steps**: Click cursor inside mixed Arabic/English text; use Left and Right arrow keys.
- **Expected Result**: Cursor moves logically according to visual/logical text direction without getting stuck or jumping unexpectedly.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 27. Text Selection & Backspace at Bidi Boundary
- **Steps**: Select across Arabic and English words; press Backspace.
- **Expected Result**: Only the selected characters are removed; remaining text joins cleanly without reversing adjacent word orders.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 6: Persistence, State & Production Rendering

#### 28. Sample Fixture Switching Session Isolation
- **Steps**: Edit text in English fixture, switch to Arabic fixture, then switch back to English fixture.
- **Expected Result**: Switching fixtures re-instantiates clean editor sessions without corrupting history or creating misleading undo entries.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 29. LocalStorage Draft Persistence with Arabic Unicode
- **Steps**: Edit an Arabic heading, refresh the browser page.
- **Expected Result**: Edited Arabic text and metadata reload accurately from LocalStorage with no encoding corruption.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 30. JSON State Export & Inspection
- **Steps**: Click **JSON State** in toolbar for the Arabic fixture.
- **Expected Result**: Modal displays canonical JSON with `metadata: { locale: "ar", direction: "rtl" }` and unescaped Arabic Unicode strings.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 31. Server-Side Rendering (SSR) in RSC Route
- **Steps**: Visit `http://localhost:3002/?fixture=arabic` directly.
- **Expected Result**: Arabic article renders server-side with `dir="rtl"` and `lang="ar"` on root container, zero client editor JavaScript bundle loaded, and zero hydration errors in console.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 32. Host Semantic Inheritance
- **Steps**: Render a document without explicit `metadata.direction` inside a host container.
- **Expected Result**: Document inherits natural direction and language from parent DOM tree without synthetic forced `dir="ltr"` attributes.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:
