import { describe, expect, it } from 'vitest';
import {
  createComponentRegistry,
  defineComponent,
  DuplicateComponentError,
  InvalidComponentError,
  createDocument,
  createNode,
  createEditor,
  validateDocument,
  type FieldTypeDefinition,
} from '../index';

describe('ComponentDefinition & defineComponent', () => {
  it('creates and freezes a valid component definition', () => {
    const hero = defineComponent({
      type: 'Hero',
      label: 'Hero Section',
      category: 'Marketing',
      description: 'Main landing page header banner.',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Welcome to iRich',
        },
        alignment: {
          type: 'select',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
          defaultValue: 'center',
        },
      },
      defaultProps: {
        title: 'Welcome to iRich',
        alignment: 'center',
      },
      slots: {
        content: { label: 'Inner Content', maxChildren: 5 },
      },
    });

    expect(hero.type).toBe('Hero');
    expect(hero.label).toBe('Hero Section');
    expect(hero.category).toBe('Marketing');
    expect(hero.fields.title.type).toBe('text');
    expect(hero.slots?.content.maxChildren).toBe(5);
    expect(Object.isFrozen(hero)).toBe(true);
    expect(Object.isFrozen(hero.fields)).toBe(true);
  });

  it('throws InvalidComponentError when definition is invalid', () => {
    expect(() => defineComponent(null as unknown as Parameters<typeof defineComponent>[0])).toThrow(
      InvalidComponentError,
    );
    expect(() =>
      defineComponent({ type: '', label: 'Test', fields: {} } as unknown as Parameters<
        typeof defineComponent
      >[0]),
    ).toThrow(InvalidComponentError);
    expect(() =>
      defineComponent({ type: 'Test', label: '', fields: {} } as unknown as Parameters<
        typeof defineComponent
      >[0]),
    ).toThrow(InvalidComponentError);
    expect(() =>
      defineComponent({ type: 'Test', label: 'Test', fields: null } as unknown as Parameters<
        typeof defineComponent
      >[0]),
    ).toThrow(InvalidComponentError);
  });
});

describe('ComponentRegistry', () => {
  it('registers, checks, gets, and unregisters components', () => {
    const registry = createComponentRegistry();

    const banner = defineComponent({
      type: 'Banner',
      label: 'Banner',
      category: 'Marketing',
      fields: {
        text: { type: 'text', label: 'Banner Text', defaultValue: 'Special Sale!' },
      },
    });

    expect(registry.has('Banner')).toBe(false);
    expect(registry.get('Banner')).toBeUndefined();
    expect(registry.getAll()).toHaveLength(0);

    registry.register(banner);

    expect(registry.has('Banner')).toBe(true);
    expect(registry.get('Banner')?.label).toBe('Banner');
    expect(registry.getAll()).toHaveLength(1);

    const unregistered = registry.unregister('Banner');
    expect(unregistered).toBe(true);
    expect(registry.has('Banner')).toBe(false);
    expect(registry.unregister('Banner')).toBe(false);
  });

  it('prevents duplicate component type registration unless allowOverride is true', () => {
    const registry = createComponentRegistry();

    const comp1 = defineComponent({
      type: 'Heading',
      label: 'Heading v1',
      fields: {
        text: { type: 'text', defaultValue: 'Hello' },
      },
    });

    const comp2 = defineComponent({
      type: 'Heading',
      label: 'Heading v2',
      fields: {
        text: { type: 'text', defaultValue: 'Updated' },
      },
    });

    registry.register(comp1);

    expect(() => registry.register(comp2)).toThrow(DuplicateComponentError);
    expect(registry.get('Heading')?.label).toBe('Heading v1');

    // With allowOverride
    registry.register(comp2, { allowOverride: true });
    expect(registry.get('Heading')?.label).toBe('Heading v2');
  });

  it('supports initial components and clear()', () => {
    const card = defineComponent({
      type: 'Card',
      label: 'Card',
      fields: { title: { type: 'text' } },
    });

    const registry = createComponentRegistry({
      components: [card],
    });

    expect(registry.getAll()).toHaveLength(1);
    expect(registry.has('Card')).toBe(true);

    registry.clear();
    expect(registry.getAll()).toHaveLength(0);
    expect(registry.has('Card')).toBe(false);
  });

  describe('Default Props Calculation', () => {
    it('computes default props from field defaults and component defaultProps', () => {
      const registry = createComponentRegistry();

      registry.register(
        defineComponent({
          type: 'Hero',
          label: 'Hero',
          fields: {
            title: { type: 'text', defaultValue: 'Default Title' },
            count: { type: 'number', defaultValue: 10 },
            visible: { type: 'boolean', defaultValue: true },
            color: { type: 'color', defaultValue: '#38bdf8' },
            align: {
              type: 'select',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              defaultValue: 'left',
            },
            bio: { type: 'textarea', defaultValue: 'A short bio' },
          },
          defaultProps: {
            title: 'Overridden Title',
          },
        }),
      );

      const defaults = registry.getDefaultProps('Hero');
      expect(defaults).toEqual({
        title: 'Overridden Title',
        count: 10,
        visible: true,
        color: '#38bdf8',
        align: 'left',
        bio: 'A short bio',
      });

      expect(registry.getDefaultProps('NonExistent')).toEqual({});
    });
  });

  describe('Prop Validation for Built-in Field Types', () => {
    it('validates text and textarea constraints', () => {
      const registry = createComponentRegistry();
      registry.register(
        defineComponent({
          type: 'TextContainer',
          label: 'Text Container',
          fields: {
            title: { type: 'text', minLength: 3, maxLength: 10, pattern: '^[A-Z]' },
            body: { type: 'textarea', minLength: 5 },
          },
        }),
      );

      // Valid props
      const validRes = registry.validateProps('TextContainer', {
        title: 'Valid',
        body: 'Valid long body text',
      });
      expect(validRes.valid).toBe(true);
      expect(validRes.errors).toHaveLength(0);

      // Invalid: title too short & doesn't start with uppercase
      const invalidRes = registry.validateProps('TextContainer', {
        title: 'ab',
        body: 'too',
      });
      expect(invalidRes.valid).toBe(false);
      expect(invalidRes.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('validates number boundaries', () => {
      const registry = createComponentRegistry();
      registry.register(
        defineComponent({
          type: 'Counter',
          label: 'Counter',
          fields: {
            count: { type: 'number', min: 0, max: 100 },
          },
        }),
      );

      expect(registry.validateProps('Counter', { count: 50 }).valid).toBe(true);
      expect(registry.validateProps('Counter', { count: -5 }).valid).toBe(false);
      expect(registry.validateProps('Counter', { count: 150 }).valid).toBe(false);
      expect(registry.validateProps('Counter', { count: '50' as unknown as number }).valid).toBe(
        false,
      );
    });

    it('validates boolean and select fields', () => {
      const registry = createComponentRegistry();
      registry.register(
        defineComponent({
          type: 'Options',
          label: 'Options',
          fields: {
            active: { type: 'boolean' },
            theme: {
              type: 'select',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
            },
          },
        }),
      );

      expect(registry.validateProps('Options', { active: true, theme: 'light' }).valid).toBe(true);
      expect(
        registry.validateProps('Options', { active: 'true' as unknown as boolean, theme: 'light' })
          .valid,
      ).toBe(false);
      expect(registry.validateProps('Options', { active: true, theme: 'neon' }).valid).toBe(false);
    });

    it('validates color field type', () => {
      const registry = createComponentRegistry();
      registry.register(
        defineComponent({
          type: 'Badge',
          label: 'Badge',
          fields: {
            bg: { type: 'color' },
          },
        }),
      );

      expect(registry.validateProps('Badge', { bg: '#ff0000' }).valid).toBe(true);
      expect(registry.validateProps('Badge', { bg: 123 as unknown as string }).valid).toBe(false);
    });

    it('returns error when validating props for unregistered component', () => {
      const registry = createComponentRegistry();
      const res = registry.validateProps('Unregistered', { a: 1 });
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('not registered');
    });
  });

  describe('Extensible Custom Field Types', () => {
    it('allows registering custom field types with validation and defaults', () => {
      const registry = createComponentRegistry();

      const dateFieldHandler: FieldTypeDefinition<string> = {
        type: 'date',
        validate(value) {
          if (typeof value !== 'string') {
            return { valid: false, error: 'Expected date ISO string' };
          }
          if (Number.isNaN(Date.parse(value))) {
            return { valid: false, error: 'Invalid ISO date string' };
          }
          return { valid: true };
        },
        getDefaultValue() {
          return '2026-01-01T00:00:00.000Z';
        },
      };

      registry.registerFieldType(dateFieldHandler);

      expect(registry.getFieldType('date')).toBeDefined();
      expect(registry.getAllFieldTypes().some((f) => f.type === 'date')).toBe(true);

      registry.register(
        defineComponent({
          type: 'EventCard',
          label: 'Event Card',
          fields: {
            eventDate: { type: 'date' },
          },
        }),
      );

      expect(registry.getDefaultProps('EventCard')).toEqual({
        eventDate: '2026-01-01T00:00:00.000Z',
      });

      expect(
        registry.validateProps('EventCard', { eventDate: '2026-12-31' }).valid,
      ).toBe(true);
      expect(
        registry.validateProps('EventCard', { eventDate: 'not-a-date' }).valid,
      ).toBe(false);
    });
  });
});

describe('Registry Integration with validateDocument & Editor', () => {
  it('validateDocument checks component registration and props against registry', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Heading',
        label: 'Heading',
        fields: {
          level: { type: 'number', min: 1, max: 6, defaultValue: 1 },
        },
      }),
    );

    const validDoc = createDocument({
      root: createNode({
        type: 'root',
        children: [
          createNode({
            type: 'Heading',
            props: { level: 2 },
          }),
        ],
      }),
    });

    const validResult = validateDocument(validDoc, { registry });
    expect(validResult.valid).toBe(true);

    const invalidDoc = createDocument({
      root: createNode({
        type: 'root',
        children: [
          createNode({
            type: 'UnregisteredType',
            props: {},
          }),
          createNode({
            type: 'Heading',
            props: { level: 10 }, // Out of range max 6
          }),
        ],
      }),
    });

    const invalidResult = validateDocument(invalidDoc, { registry });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some((e) => e.includes('UnregisteredType'))).toBe(true);
    expect(invalidResult.errors.some((e) => e.includes('level'))).toBe(true);
  });

  it('Editor accepts registry and populates default props on node insertion', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Hero',
        label: 'Hero',
        fields: {
          title: { type: 'text', defaultValue: 'Default Title' },
          align: {
            type: 'select',
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
            ],
            defaultValue: 'center',
          },
        },
      }),
    );

    const editor = createEditor({ registry });
    expect(editor.getRegistry()).toBe(registry);

    // Insert node with empty props -> registry default props auto-populate
    const nodeId = editor.commands.insertNode({
      node: createNode({
        type: 'Hero',
        props: {},
      }),
    });

    const insertedNode = editor.getNode(nodeId);
    expect(insertedNode?.props).toEqual({
      title: 'Default Title',
      align: 'center',
    });

    // Custom props override defaults
    const customNodeId = editor.commands.insertNode({
      node: createNode({
        type: 'Hero',
        props: { title: 'Custom Title' },
      }),
    });

    const customNode = editor.getNode(customNodeId);
    expect(customNode?.props).toEqual({
      title: 'Custom Title',
      align: 'center',
    });
  });
});
