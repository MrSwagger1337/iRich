# iRich

> Extensible visual content editor and page builder for React.

iRich bridges the gap between structured rich-text editors and visual page builders. It empowers developers and content authors to build rich interactive documents and modular page layouts within a unified, extensible React ecosystem.

## Features & Philosophy

- **Unified Editing**: Blends block-based page building with inline rich-text authoring.
- **Pure React Core**: Works seamlessly in any standard React application (Vite, Next.js, Remix, etc.) without vendor lock-in.
- **Extensible Architecture**: Clean plugin and extension APIs to define custom blocks, marks, controls, and renderers.
- **Type-Safe**: Written in TypeScript with strict mode enabled throughout.

## Monorepo Layout

```
irich/
├── apps/
│   ├── docs/          # Documentation website (Next.js)
│   └── playground/    # Interactive prototyping & testing playground (Next.js)
├── packages/
│   ├── core/          # Core editor engine, state model, and command pipeline
│   ├── react/         # React provider, hooks, and editor components
│   ├── renderer/      # Component tree renderer registry & engine
│   ├── ui/            # UI components and toolbars
│   ├── rich-text/     # Rich text marks, formatting, and inline nodes
│   └── plugin-sdk/    # SDK for authoring third-party and custom plugins
├── examples/
│   ├── nextjs-basic/  # Next.js integration example
│   └── react-vite/    # Standalone React + Vite example
└── docs/              # Specifications, design records, and guides
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Installation

```bash
pnpm install
```

### Development Scripts

```bash
# Build all packages and applications
pnpm build

# Run unit tests
pnpm test

# Run TypeScript typechecks across the workspace
pnpm typecheck

# Run linter
pnpm lint

# Start development servers
pnpm dev
```

## License

MIT
