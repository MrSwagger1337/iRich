# iRich Document JSON Studio Human Testing Checklist

> **Purpose**: This checklist guides human manual verification for the **Document JSON Studio (Copy -> AI -> Paste -> Validate -> Apply -> Undo)** workflow in **iRich Phase 3**.
>
> **Instruction for Tester**: Follow each scenario in a real web browser. Record findings and verify state transitions.
>
> **Current Status**: All test items below are initialized to **`NOT TESTED BY HUMAN`** pending human physical browser execution.

---

## Testing Environment & Quick Start

```bash
pnpm dev:nextjs-example
```

- **Visual Editor Studio**: `http://localhost:3002/editor`

---

## 32-Item Manual Verification Checklist

### Section 1: Opening, Snapshot & Copying

#### 1. Initial Studio Opening (English Document)
- **Steps**: In `/editor`, click **JSON State** button in toolbar with the English Landing Page active.
- **Expected Result**: Studio modal opens cleanly; status badge shows `Live Canonical Snapshot`; draft textarea displays formatted JSON matching the live document.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 2. Copy JSON Action
- **Steps**: Click **📋 Copy JSON** button in the studio toolbar.
- **Expected Result**: Feedback banner announces `✓ Copied Draft JSON`; pasting into an external text editor produces the exact draft JSON.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 3. Copy AI Context Action
- **Steps**: Click **✨ Copy AI Context** button.
- **Expected Result**: Feedback banner announces `✓ Copied AI Context Prompt`; pasted text includes instructions, list of registered components (`Hero`, `Heading`, `Container`, `Card`, `Button`, `RichText`), declared props, and current document JSON.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 4. Formatting Valid JSON
- **Steps**: In the textarea, compress JSON onto fewer lines or add irregular spacing, then click **⚡ Format**.
- **Expected Result**: JSON is re-indented with standard 2-space formatting.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 5. Format Is Not Validate (Invalid Document Structure)
- **Steps**: Replace textarea with syntactically valid non-iRich JSON `{"greeting": "hello"}` and click **⚡ Format**.
- **Expected Result**: JSON reformats cleanly; status becomes `Draft Modified`; **Apply Document** button remains disabled.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 6. Formatting Malformed JSON Syntax
- **Steps**: Introduce a syntax error (e.g. `{ unquoted_key: 123 }`) and click **⚡ Format**.
- **Expected Result**: User's draft is preserved completely without loss; feedback alert announces `JSON Syntax Error`.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 2: Validation & Structured Diagnostics

#### 7. Validating Valid Unchanged Draft
- **Steps**: Click **🔍 Validate** on the initial unmodified draft.
- **Expected Result**: Status badge turns green `✓ Valid & Ready to Apply`; success banner appears; **Apply Document** button is enabled.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 8. Validating JSON Syntax Error
- **Steps**: Enter invalid JSON (e.g. `{ "title": `) and click **🔍 Validate**.
- **Expected Result**: Status badge turns red `✕ Validation Errors`; diagnostic card displays `INVALID_JSON` with path and error message.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 9. Validating Unregistered Component Type
- **Steps**: Add a node with `"type": "UnknownMegaSection"` and click **🔍 Validate**.
- **Expected Result**: Diagnostic card shows `UNKNOWN_COMPONENT`, path `root.children[...]`, node type `UnknownMegaSection`, and clear explanation that the component is not registered.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 10. Validating Invalid Property Value
- **Steps**: In a `Heading` node, change `"level": 1` to `"level": "invalid_string"` or an out-of-range value and click **🔍 Validate**.
- **Expected Result**: Diagnostic card shows `INVALID_PROP` with prop name and failure reason.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 11. Validating Duplicate Node IDs
- **Steps**: Duplicate an existing node ID across two nodes in the `children` array and click **🔍 Validate**.
- **Expected Result**: Diagnostic card reports `DUPLICATE_NODE_ID` with the conflicting ID.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 12. Copy Errors Action
- **Steps**: While validation errors are visible, click **📋 Copy Errors**.
- **Expected Result**: Feedback announces `✓ Copied Error Diagnostics`; pasted text contains structured list of all issues suitable for feeding back to an external AI agent.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 3: Invalidation & Atomic Application

#### 13. Validation Invalidation Invariant
- **Steps**: Validate a valid document (Apply enabled), then type one additional character in the textarea.
- **Expected Result**: **Apply Document** button immediately disables; status changes to `Draft Modified`; cached validation is cleared.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 14. Apply Valid Restructured Document
- **Steps**: Paste a valid restructured JSON payload with different text and components, click **🔍 Validate**, then click **✓ Apply Document**.
- **Expected Result**: Modal updates status to `✓ Document Applied`; live canvas updates immediately with the new structure and content.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 15. Single-Step Undo Restores Previous Document
- **Steps**: Close studio (or keep open) and click **↺ Undo** in the top editor toolbar.
- **Expected Result**: In exactly 1 undo step, the canvas reverts to the document state prior to the JSON application.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 16. Single-Step Redo Re-applies Restructured Document
- **Steps**: Click **↻ Redo** in the top toolbar.
- **Expected Result**: Canvas immediately restores the applied restructured document.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 4: Draft Management & File Operations

#### 17. Reset Draft Action
- **Steps**: Make arbitrary modifications in the draft textarea, then click **↺ Reset Draft**.
- **Expected Result**: Draft textarea reverts to the live canvas snapshot; diagnostics clear; status returns to `Live Canonical Snapshot`.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 18. Load File (.json / .irich.json)
- **Steps**: Click **📁 Load File** and select a `.json` file from disk.
- **Expected Result**: File content loads into draft textarea; status becomes `Draft Modified`; document on live canvas is **NOT** automatically applied.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 19. Download JSON Action
- **Steps**: Click **💾 Download JSON**.
- **Expected Result**: Browser downloads `<safe-title>.irich.json` containing the current live canonical document formatted with 2 spaces.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 20. Re-importing Downloaded File
- **Steps**: Load the downloaded `.irich.json` file back into the studio and click **🔍 Validate**.
- **Expected Result**: Validates successfully with 0 errors.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 5: Multilingual & Arabic RTL Scenarios

#### 21. Open Arabic RTL Document Studio
- **Steps**: Switch fixture to **🇸🇦 Arabic RTL**, open **JSON State**.
- **Expected Result**: Textarea loads Arabic text with `metadata: { locale: "ar", direction: "rtl" }` and unescaped Arabic Unicode strings.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 22. Textarea Code Direction Under RTL
- **Steps**: Observe the textarea while viewing Arabic document.
- **Expected Result**: Textarea maintains `dir="ltr"` code orientation (braces, quotes, and JSON keys align on the left) while Arabic text inside strings reads right-to-left naturally.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 23. Studio Chrome Under RTL UI Direction
- **Steps**: Set **UI: RTL** in top toolbar, open **JSON State**.
- **Expected Result**: Studio modal chrome (header, title, toolbar buttons, close button) renders in RTL layout, while the code textarea remains strictly LTR.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 24. Arabic Text Unicode Preservation in Copy/Paste
- **Steps**: Copy Arabic draft JSON, paste into external editor, edit an Arabic phrase, paste back, validate, and apply.
- **Expected Result**: Arabic text renders accurately on the canvas without question marks, escaped codes, or broken ligatures.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 25. Arabic Document Download Fidelity
- **Steps**: Download JSON for the Arabic document, open downloaded file in a text editor.
- **Expected Result**: File contains raw UTF-8 Arabic characters without `\uXXXX` escaping.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 6: Dirty Draft Protection & Accessibility

#### 26. Clean Close (No Edits)
- **Steps**: Open JSON Studio and immediately click ✕ or press Escape.
- **Expected Result**: Modal closes smoothly without any warning prompt.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 27. Dirty Draft Close Warning
- **Steps**: Modify textarea text, then click ✕ or press Escape.
- **Expected Result**: Discard confirmation dialog appears: "You have modified the JSON draft without applying it to the document."
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 28. Keep Editing in Discard Dialog
- **Steps**: In the discard confirmation dialog, click **Keep Editing**.
- **Expected Result**: Dialog closes; user remains in the JSON Studio with all draft edits preserved.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 29. Confirm Discard & Close
- **Steps**: In discard dialog, click **Discard & Close**.
- **Expected Result**: Studio closes; live canvas document remains completely unchanged.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 30. Keyboard Accessibility & Focus
- **Steps**: Navigate the studio using `Tab` and `Shift+Tab`.
- **Expected Result**: Focus indicators are clearly visible on all toolbar buttons, textarea, and close button.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

#### 31. Screen Reader Status Announcements
- **Steps**: Trigger Copy JSON, Format, and Validate.
- **Expected Result**: Status updates are rendered with `aria-live="polite"` and `role="status"` for assistive technologies.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:

---

### Section 7: Genuine External AI Round-Trip (Owner Manual Test)

#### 32. External AI Restructuring Round-Trip
- **Steps**:
  1. Open an article in iRich.
  2. Click **✨ Copy AI Context**.
  3. Paste the prompt into an external AI model (ChatGPT, Claude, Gemini).
  4. Ask the AI: *"Restructure this article into an executive overview with a Hero section, feature Cards, and key bullet points."*
  5. Copy the returned JSON from the AI model.
  6. Paste it into the iRich JSON Studio textarea.
  7. Click **🔍 Validate** (if errors occur, click **📋 Copy Errors** and ask the AI to fix them).
  8. Click **✓ Apply Document**.
  9. Verify the live canvas updates with the AI redesigned article.
  10. Press **↺ Undo** to verify the original article is restored.
- **Expected Result**: Document transforms smoothly and reverts cleanly.
- **Status**: `NOT TESTED BY HUMAN`
- **Notes**:
