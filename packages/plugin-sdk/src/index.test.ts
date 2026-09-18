import { describe, it, expect, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createEditor,
  createComponentRegistry,
  defineComponent,
} from '@irich/core';
import {
  definePlugin,
  createPluginManager,
  DuplicatePluginError,
  PluginNotFoundError,
  PluginCommandError,
  type PluginContext,
} from './index';

describe('@irich/plugin-sdk', () => {
  describe('definePlugin', () => {
    it('should return a valid plugin definition', () => {
      const plugin = definePlugin({
        name: 'test-plugin',
        version: '1.0.0',
      });

      expect(plugin.name).toBe('test-plugin');
      expect(plugin.version).toBe('1.0.0');
    });

    it('should throw an error if plugin definition is invalid or missing name', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => definePlugin(null as any)).toThrow(TypeError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => definePlugin({} as any)).toThrow(TypeError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => definePlugin({ name: '   ' } as any)).toThrow(TypeError);
    });
  });

  describe('PluginManager registration and duplicates', () => {
    it('should register and retrieve plugins', () => {
      const manager = createPluginManager();
      const p1 = definePlugin({ name: 'p1', version: '1.0.0' });
      const p2 = definePlugin({ name: 'p2', version: '2.0.0' });

      manager.register(p1);
      manager.register(p2);

      expect(manager.has('p1')).toBe(true);
      expect(manager.has('p2')).toBe(true);
      expect(manager.has('p3')).toBe(false);

      expect(manager.get('p1')).toBe(p1);
      expect(manager.get('p2')).toBe(p2);
      expect(manager.getAll()).toEqual([p1, p2]);
    });

    it('should prevent duplicate plugin registration', () => {
      const manager = createPluginManager();
      const p1 = definePlugin({ name: 'p1' });

      manager.register(p1);
      expect(() => manager.register(p1)).toThrow(DuplicatePluginError);
    });

    it('should unregister a plugin and throw PluginNotFoundError if not found', () => {
      const manager = createPluginManager();
      const p1 = definePlugin({ name: 'p1' });

      manager.register(p1);
      expect(manager.has('p1')).toBe(true);

      manager.unregister('p1');
      expect(manager.has('p1')).toBe(false);

      expect(() => manager.unregister('p1')).toThrow(PluginNotFoundError);
    });
  });

  describe('Plugin Lifecycle & Context', () => {
    it('should execute setup and destroy hooks with a safe PluginContext', () => {
      const setupSpy = vi.fn();
      const cleanupSpy = vi.fn();
      const destroySpy = vi.fn();

      const plugin = definePlugin({
        name: 'lifecycle-plugin',
        setup(ctx: PluginContext) {
          setupSpy(ctx.pluginName);
          expect(ctx.getDocument().root.id).toBe('root');
          return () => {
            cleanupSpy();
          };
        },
        destroy(ctx: PluginContext) {
          destroySpy(ctx.pluginName);
        },
      });

      const editor = createEditor({
        initialDocument: createDocument({
          root: createNode({ id: 'root', type: 'root' }),
        }),
      });

      const manager = createPluginManager({ plugins: [plugin] });
      expect(setupSpy).not.toHaveBeenCalled(); // not yet initialized with editor

      manager.init(editor);
      expect(setupSpy).toHaveBeenCalledWith('lifecycle-plugin');

      manager.unregister('lifecycle-plugin');
      expect(cleanupSpy).toHaveBeenCalledTimes(1);
      expect(destroySpy).toHaveBeenCalledWith('lifecycle-plugin');
    });

    it('should auto-cleanup event subscriptions upon unregister', () => {
      const changeSpy = vi.fn();
      const nodeInsertSpy = vi.fn();

      const plugin = definePlugin({
        name: 'events-plugin',
        events: {
          'document:change': (payload) => {
            changeSpy(payload.document);
          },
        },
        setup(ctx) {
          ctx.on('node:insert', (payload) => {
            nodeInsertSpy(payload.node.id);
          });
        },
      });

      const editor = createEditor({
        initialDocument: createDocument({
          root: createNode({ id: 'root', type: 'root' }),
        }),
      });

      const manager = createPluginManager({ editor, plugins: [plugin] });

      // Trigger mutation
      editor.commands.insertNode({
        node: createNode({ id: 'node-1', type: 'Text', props: { text: 'Hello' } }),
      });

      expect(nodeInsertSpy).toHaveBeenCalledWith('node-1');
      expect(changeSpy).toHaveBeenCalledTimes(1);

      // Unregister plugin
      manager.unregister('events-plugin');

      // Trigger another mutation
      editor.commands.insertNode({
        node: createNode({ id: 'node-2', type: 'Text', props: { text: 'World' } }),
      });

      // Spies should not have received the second mutation events
      expect(nodeInsertSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow plugin commands to execute via manager and context', () => {
      const plugin = definePlugin({
        name: 'calc-plugin',
        commands: {
          add: (_ctx, payload: { a: number; b: number }) => payload.a + payload.b,
          multiply: (ctx, payload: { a: number; b: number }) => {
            // Can call another plugin command from within context
            const sum = ctx.executeCommand<number>('add', { a: payload.a, b: 0 });
            return sum * payload.b;
          },
        },
      });

      const editor = createEditor();
      const manager = createPluginManager({ editor, plugins: [plugin] });

      expect(manager.hasCommand('add')).toBe(true);
      expect(manager.hasCommand('multiply')).toBe(true);
      expect(manager.getCommands()).toContain('add');
      expect(manager.getCommands()).toContain('multiply');

      const sumResult = manager.executeCommand<number>('add', { a: 5, b: 7 });
      expect(sumResult).toBe(12);

      const mulResult = manager.executeCommand<number>('multiply', { a: 3, b: 4 });
      expect(mulResult).toBe(12);

      expect(() => manager.executeCommand('nonExistent')).toThrow(PluginCommandError);
    });

    it('should register and unregister contributed components with ComponentRegistry', () => {
      const registry = createComponentRegistry();
      const bannerComponent = defineComponent({
        type: 'Banner',
        label: 'Banner',
        category: 'Marketing',
        fields: {
          title: {
            type: 'text',
            label: 'Title',
          },
        },
      });

      const plugin = definePlugin({
        name: 'banner-plugin',
        components: [bannerComponent],
      });

      const editor = createEditor({ registry });
      const manager = createPluginManager({ editor });

      expect(registry.has('Banner')).toBe(false);

      manager.register(plugin);
      expect(registry.has('Banner')).toBe(true);
      expect(registry.get('Banner')?.type).toBe('Banner');
      expect(registry.get('Banner')?.label).toBe('Banner');

      manager.unregister('banner-plugin');
      expect(registry.has('Banner')).toBe(false);
    });

    it('should safely expose editor state queries and transactional mutations', () => {
      let capturedContext!: PluginContext;

      const plugin = definePlugin({
        name: 'query-plugin',
        setup(ctx) {
          capturedContext = ctx;
        },
      });

      const editor = createEditor({
        initialDocument: createDocument({
          root: createNode({ id: 'root', type: 'root' }),
        }),
      });

      const manager = createPluginManager({ editor, plugins: [plugin] });

      expect(capturedContext.getState().document.root.id).toBe('root');
      expect(capturedContext.getDocument().root.id).toBe('root');
      expect(capturedContext.getSelection()).toBeNull();

      // Dispatch mutation via ctx.commands
      capturedContext.commands.insertNode({
        node: createNode({ id: 'card-1', type: 'Card' }),
      });

      expect(capturedContext.getNode('card-1')).toBeDefined();
      expect(capturedContext.getNode('card-1')?.type).toBe('Card');

      manager.destroy();
    });
  });
});
