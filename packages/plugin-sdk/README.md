# @irich/plugin-sdk

> Extensibility API, lifecycle contracts, and plugin manager for **iRich**.

---

## Features

- **Modular Extension Model**: Create plugins with `definePlugin` contributing custom commands, event subscriptions, and component definitions.
- **Safe Plugin Context**: Strict isolation prevents plugins from mutating private internal engine state directly.
- **Deterministic Teardown**: Clean `setup` and `teardown` lifecycle methods for managing timers and streams.

---

## Installation

\`\`\`bash
pnpm add @irich/core @irich/plugin-sdk
\`\`\`

---

## Basic Usage

\`\`\`typescript
import { definePlugin, type PluginContext } from '@irich/plugin-sdk';

export const analyticsPlugin = definePlugin({
  name: 'analytics',
  version: '1.0.0',

  setup(ctx: PluginContext) {
    ctx.on('node:insert', ({ node }) => {
      console.log('Inserted node:', node.type);
    });
  },

  teardown(ctx: PluginContext) {
    console.log('Plugin cleaned up');
  },
});
\`\`\`

---

## License

MIT
