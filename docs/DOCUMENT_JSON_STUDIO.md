# iRich Document JSON Studio

> Complete guide to the **Document JSON Studio** workflow: **Copy -> AI -> Paste -> Validate -> Apply -> Undo**.

---

## 1. Overview & Purpose

iRich documents are strictly serializable to standard JSON. The **Document JSON Studio** bridges visual authoring and external AI-assisted content workflows.

```
+------------------+         +--------------------+         +--------------------+
|  Visual Editor   | ------> | Export JSON/Prompt | ------> | External AI Agent  |
| (Interactive UI) |         | (Copy JSON Context)|         | (Claude, GPT, etc) |
+------------------+         +--------------------+         +--------------------+
         ^                                                             |
         |                   +--------------------+                    |
         +------------------ |  Validate & Apply  | <------------------+
          (1-Step Undo/Redo) | (replaceDocument)  |  (Paste Redesign)
                             +--------------------+
```

---

## 2. Core Security & Architectural Principles

1. **Strictly Data-Only Exchange**:
   The exchange format between iRich and external AI tools is strictly JSON. iRich **NEVER** executes JavaScript, JSX components, CSS stylesheets, or arbitrary HTML scripts embedded in imported documents.
2. **Schema & Invariant Enforcement**:
   Every incoming document must pass comprehensive structural and schema validation before it can be applied to the live canvas.
3. **Atomic Replacement with 1-Step Undo**:
   Applying a validated document replaces the current document atomically via `editor.commands.replaceDocument(...)`, creating a single undoable history step. Pressing `Undo` immediately restores the previous article state.

---

## 3. The Reusable Component (`@irich/react`)

The Document JSON Studio is exported as `<IRichDocumentJsonStudio />` and `<IRichDocumentJsonModal />` from `@irich/react`:

```tsx
import { IRichDocumentJsonModal } from '@irich/react';

function MyEditor() {
  const [showJsonStudio, setShowJsonStudio] = useState(false);

  return (
    <>
      <button onClick={() => setShowJsonStudio(true)}>Document JSON Studio</button>
      <IRichDocumentJsonModal
        isOpen={showJsonStudio}
        onClose={() => setShowJsonStudio(false)}
      />
    </>
  );
}
```

### Key Operations & Behaviors

| Action | Description | Behavior |
| :--- | :--- | :--- |
| **Copy JSON** | Copies current draft JSON text to clipboard. | Copies exact draft text regardless of validity state. |
| **Copy AI Context** | Generates and copies a structured AI prompt containing schema definitions and document JSON. | Derives component schemas directly from the `ComponentRegistry`. |
| **Format** | Standardizes JSON indentation (2 spaces). | Validates JSON syntax only; does **NOT** imply document schema validity. |
| **Validate** | Runs full validation against document invariants and component field schemas. | Displays structured error cards with node IDs, types, and paths. |
| **Apply Document** | Atomically applies the validated document to the live editor canvas. | **Disabled** until current draft passes validation. Any subsequent edit immediately disables Apply. |
| **Reset Draft** | Restores the draft textarea to the live canonical document snapshot. | Clears diagnostics without mutating the live document. |
| **Load File** | Imports a local `.json` or `.irich.json` file. | Places content in draft; **never auto-applies**. |
| **Download JSON** | Exports the current live canonical document. | Generates UTF-8 `<title>.irich.json` without ASCII escaping. |
| **Copy Errors** | Copies formatted diagnostic error report. | Generates clear text suitable for pasting back into AI conversations. |

---

## 4. State Lifecycle & Validation Invariant

```
       +---------------------------------------------+
       |                                             |
       v                                             |
   [ IDLE ] --(edit textarea)--> [ DIRTY ] <---------+
       ^                            |                |
       |                         (validate)          |
  (reset draft)                     |                |
       |                            v                |
       +--------------------- [ VALIDATING ]         |
                                /        \           |
                         (valid)          (invalid)  |
                           v                  v      |
                       [ VALID ]         [ INVALID ] |
                           |                         |
                        (apply)                      |
                           v                         |
                      [ APPLIED ] -------------------+
```

### Exact Draft Invariant
Validation is bound strictly to the **exact text string** that was validated. If the author or AI modifies a single character after validation, `validatedDocument` is invalidated, `status` returns to `dirty`, and `Apply Document` is disabled until the updated draft is re-validated.

---

## 5. Structured Diagnostics Reference

When validation fails, iRich outputs detailed diagnostic objects:

```typescript
export interface ValidationErrorDetail {
  code: ValidationErrorCode;
  message: string;
  path?: string;
  nodeId?: string;
  nodeType?: string;
  propName?: string;
}
```

### Diagnostic Codes

| Code | Explanation | Example Remedy |
| :--- | :--- | :--- |
| `INVALID_JSON` | Syntax error in JSON string (unclosed braces, trailing commas). | Fix JSON syntax. |
| `INVALID_ROOT` | Document missing `root` object or incorrect `root.id`/`root.type`. | Ensure `root: { id: "root", type: "root", props: {}, children: [...] }`. |
| `INVALID_NODE_ID` | Node ID is empty or invalid format. | Assign valid string IDs (e.g. `"hero-1"`). |
| `DUPLICATE_NODE_ID` | Multiple nodes share the same `id`. | Make every node ID unique across the tree. |
| `UNKNOWN_COMPONENT` | Node `type` is not registered in the `ComponentRegistry`. | Use only registered component types. |
| `INVALID_PROP` | Property value fails schema validation or field constraints. | Ensure property values match declared types (text, number, select). |
| `INVALID_PLACEMENT` | Component placed in an unauthorized parent or slot. | Move node to an allowed container or slot. |
| `UNSAFE_VALUE` | Prototype pollution key (`__proto__`, `constructor`) detected. | Remove unsafe keys. |

---

## 6. Multilingual & RTL Support

1. **UTF-8 Unicode Preservation**:
   All JSON import/export operations preserve Arabic, English, French, Dutch, and emoji Unicode characters directly without escaping them into `\uXXXX` sequences.
2. **Strict LTR Editing Surface**:
   Even when the editor studio chrome is rendered in Right-to-Left mode (`IRichUIDirection = 'rtl'`), the JSON editing `<textarea>` is strictly rendered with `dir="ltr"` and `text-align: left`. This guarantees proper punctuation and bracket alignment for code editing while preserving RTL content inside string literals.
