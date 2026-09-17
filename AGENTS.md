# AGENTS.md

> Operational context and engineering guidelines for AI coding agents working on **iRich**.

iRich is an embeddable, extensible visual content editor and page builder for React. It bridges structured rich-text authoring and modular component-based page composition.

---

## Core Architectural Principles

### 1. Framework-Independent Core

`@irich/core` MUST NOT import:

- React or `react-dom`
- Next.js or any meta-framework packages
- Browser-only APIs (must be able to execute in pure Node.js/worker environments)

### 2. React-First UI

React-specific bindings, hooks, context providers, and editor components belong strictly in `@irich/react` and `@irich/ui`.

### 3. Next.js Compatibility

Next.js is a first-class supported consumer (used for docs, playground, and example apps), but **no core package may depend on or require Next.js**.

### 4. JSON-Serializable Documents

The canonical iRich document state MUST be strictly serializable to standard JSON.

**NEVER store inside document state:**

- React components or JSX elements
- DOM nodes or references
- Functions or callbacks
- Class instances or non-plain objects

### 5. Stable Node IDs

Every document node MUST have a unique, stable ID (`NodeId`) preserved across reorders, moves, and property updates.

### 6. Command-Based Mutations

All document state mutations MUST be dispatched through structured editor commands and transactions.

- Examples: `insertNode`, `removeNode`, `moveNode`, `updateNode`, `duplicateNode`
- React components and UI handlers must never directly mutate document state.

### 7. Renderer / Editor Separation

Production rendering (`@irich/renderer`) must be lightweight and standalone. Rendering an iRich document on a published page must NOT require loading the visual editor, canvas controllers, or property sidebars.

### 8. Component Registry

Application components must be registered via iRich component definitions with explicit prop schemas, default props, and renderer mappings.

### 9. Plugin Isolation

Plugins must interact only through documented APIs, commands, event listeners, and extension points. Plugins must never reach into or mutate private internal engine state directly.

### 10. Strict TypeScript

- Always enforce TypeScript strict mode.
- Avoid `any`. Use generics, `unknown`, or discriminated unions where appropriate.
- Every public API, interface, and exported function signature must have explicit type annotations.

### 11. Testing & Quality

- Core commands, transactions, and document transformations require automated unit tests.
- Bug fixes require regression tests when practical.
- Vitest suites must run deterministically with zero flaky tests.

### 12. Immutability

Document state updates must strictly preserve immutable-state semantics (e.g. shallow copies or structural sharing), enabling fast reference equality checks and memoization in React.

### 13. Dependency Boundaries

Maintain clean, directed dependency layers across packages. Never introduce circular dependencies between packages.

```
@irich/core
  ├── @irich/plugin-sdk (depends on @irich/core)
  ├── @irich/renderer   (depends on @irich/core)
  ├── @irich/rich-text  (depends on @irich/core, @irich/plugin-sdk)
  └── @irich/ui         (depends on react, react-dom)
@irich/react (depends on @irich/core, @irich/renderer, @irich/plugin-sdk, @irich/rich-text, @irich/ui, react, react-dom)
```

### 14. Clean Public APIs

Do not expose internal implementation details or temporary helper functions from package root exports (`src/index.ts`). Expose only deliberate public APIs.

### 15. Backwards Compatibility

Do not casually modify or break existing public APIs. If a public API must change, clearly document and explain the rationale before implementing the change.

### 16. Accessibility (a11y)

Editor UI and toolbar primitives must use accessible semantic HTML, proper ARIA attributes, and keyboard navigation support where practical.

### 17. Performance & Fine-Grained Reactivity

Avoid rerendering the entire editor tree for localized document updates (e.g. updating a single node property or text span). Use selective subscriptions or targeted context slices.

### 18. Security

- Never execute arbitrary code or `eval` expressions stored within an iRich document.
- Treat all document contents, attributes, and user input as untrusted data.

### 19. Server-Side Rendering (SSR)

- Renderer functionality must support server-side rendering (SSR / RSC) without browser dependencies.
- Interactive editor controls and canvas overlays may be client-only (`use client`) where browser APIs (such as DOM measurements or drag-and-drop events) are required.

### 20. Scope Discipline

- Only implement the specifically requested task.
- Do not opportunistically rewrite unrelated systems or introduce unsolicited architectural changes.

---

## Git & Monorepo Workflow

- **Remote Repository**: Always push commits to `https://github.com/MrSwagger1337/iRich` on branch `main`.
- **Atomic Commits**: Make clear, conventional commits describing the feature, fix, or documentation change.

---

## Required Development Workflow

Before and during implementation of any feature or modification:

1. **Read AGENTS.md** and relevant documentation in `/docs`.
2. **Inspect existing APIs** and adhere to established package boundaries.
3. **Write a short implementation plan** before making complex modifications.
4. **Implement the smallest coherent solution** that satisfies requirements.
5. **Add or update tests** covering the changes.
6. **Run linter**: `pnpm lint`
7. **Run typecheck**: `pnpm typecheck`
8. **Run test suite**: `pnpm test`
9. **Run build**: `pnpm build`
10. **Push changes** to the remote repository.

> [!IMPORTANT]
> Never report task completion while `pnpm lint`, `pnpm typecheck`, `pnpm test`, or `pnpm build` are failing.
