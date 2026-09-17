# iRich Architecture Overview

## Vision

iRich is an extensible visual content editor and page builder for React. It combines the ergonomic, structured rich-text authoring experience typically found in editors like Tiptap with the flexible visual layout and component composition paradigms of visual page builders like Puck.

## Monorepo Architecture

```
irich/
├── apps/
│   ├── docs/          # Next.js documentation portal
│   └── playground/    # Next.js interactive editor canvas & playground
├── packages/
│   ├── core/          # Framework-agnostic document state, transactions, nodes & commands
│   ├── plugin-sdk/    # Plugin authoring kit and lifecycle hooks
│   ├── renderer/      # Agnostic document & node tree rendering pipeline
│   ├── rich-text/     # Rich text primitives, marks, and typography extensions
│   ├── ui/            # Agnostic & styled UI elements (toolbars, sidebars, property panels)
│   └── react/         # Core React integration, hooks (`useIRich`), and context provider
├── examples/
│   ├── nextjs-basic/  # Next.js integration example
│   └── react-vite/    # Pure React + Vite integration example
└── docs/              # Specifications and developer guides
```

## Key Principles

1. **Framework Agnostic Core**: Core data structures and state machines are standalone. The React bindings work in standard React applications (Vite, CRA, Remix, Next.js, etc.).
2. **Independent Architecture**: Own data schema, transaction system, and public APIs.
3. **Pluggable & Extensible**: Modular package design allowing custom node definitions, marks, toolbars, and layout managers.
