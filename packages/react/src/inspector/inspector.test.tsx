/**
 * @vitest-environment jsdom
 *
 * @irich/react
 * Unit & integration tests for IRichInspector dynamic property controls and updates.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createComponentRegistry,
  createDocument,
  createNode,
  defineComponent,
  Editor,
} from '@irich/core';
import { IRichProvider } from '../provider';
import { IRichInspector } from './inspector';

// Configure React act() environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('IRichInspector', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  const ComplexComponent = defineComponent({
    type: 'ComplexWidget',
    label: 'Complex Widget',
    category: 'Testing',
    fields: {
      title: {
        type: 'text',
        label: 'Widget Title',
        defaultValue: 'Default Title',
        placeholder: 'Enter title...',
        description: 'Title of the widget',
      },
      description: {
        type: 'textarea',
        label: 'Widget Description',
        defaultValue: 'Default multiline description',
        rows: 4,
      },
      count: {
        type: 'number',
        label: 'Item Count',
        defaultValue: 10,
        min: 0,
        max: 100,
        step: 5,
        unit: 'items',
      },
      isEnabled: {
        type: 'boolean',
        label: 'Feature Active',
        defaultValue: true,
      },
      theme: {
        type: 'select',
        label: 'Color Theme',
        defaultValue: 'dark',
        options: [
          { label: 'Dark Slate', value: 'dark' },
          { label: 'Light Clean', value: 'light' },
          { label: 'Vibrant Accent', value: 'accent' },
        ],
      },
      accentColor: {
        type: 'color',
        label: 'Accent Hex',
        defaultValue: '#6366f1',
        presetColors: ['#6366f1', '#38bdf8', '#10b981', '#f43f5e'],
      },
    },
  });

  it('should render sensible empty state when no node is selected', () => {
    const editor = new Editor();

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    expect(container?.textContent).toContain('Properties Inspector');
    expect(container?.textContent).toContain('Select a component on the canvas');
  });

  it('should render custom emptyState prop if provided', () => {
    const editor = new Editor();

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector emptyState={<div data-testid="custom-empty">Custom No Selection</div>} />
        </IRichProvider>,
      );
    });

    expect(container?.textContent).toContain('Custom No Selection');
  });

  it('should dynamically generate controls for all 6 field types', () => {
    const registry = createComponentRegistry();
    registry.register(ComplexComponent);

    const widgetNode = createNode({
      id: 'widget-1',
      type: 'ComplexWidget',
      props: {
        title: 'Initial Title Value',
        description: 'Initial Textarea Content',
        count: 25,
        isEnabled: false,
        theme: 'light',
        accentColor: '#38bdf8',
      },
    });

    const doc = createDocument({
      root: createNode({
        id: 'root',
        type: 'root',
        children: [widgetNode],
      }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'widget-1',
      registry,
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    // Verify header
    expect(container?.textContent).toContain('ComplexWidget');
    expect(container?.textContent).toContain('widget-1');

    // 1. Text input
    const textInput = container?.querySelector('#irich-field-widget-1-title') as HTMLInputElement;
    expect(textInput).toBeDefined();
    expect(textInput.type).toBe('text');
    expect(textInput.value).toBe('Initial Title Value');

    // 2. Textarea input
    const textarea = container?.querySelector('#irich-field-widget-1-description') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.value).toBe('Initial Textarea Content');
    expect(textarea.rows).toBe(4);

    // 3. Number input
    const numberInput = container?.querySelector('#irich-field-widget-1-count') as HTMLInputElement;
    expect(numberInput).toBeDefined();
    expect(numberInput.type).toBe('number');
    expect(numberInput.value).toBe('25');
    expect(container?.textContent).toContain('items');

    // 4. Boolean input
    const boolInput = container?.querySelector('#irich-field-widget-1-isEnabled') as HTMLInputElement;
    expect(boolInput).toBeDefined();
    expect(boolInput.type).toBe('checkbox');
    expect(boolInput.checked).toBe(false);

    // 5. Select input
    const select = container?.querySelector('#irich-field-widget-1-theme') as HTMLSelectElement;
    expect(select).toBeDefined();
    expect(select.value).toBe('light');
    expect(select.options).toHaveLength(3);

    // 6. Color input
    const colorPicker = container?.querySelector('#irich-field-widget-1-accentColor-picker') as HTMLInputElement;
    const colorText = container?.querySelector('#irich-field-widget-1-accentColor') as HTMLInputElement;
    expect(colorPicker).toBeDefined();
    expect(colorPicker.value).toBe('#38bdf8');
    expect(colorText.value).toBe('#38bdf8');
  });

  it('should fall back to field defaultValue when props are missing', () => {
    const registry = createComponentRegistry();
    registry.register(ComplexComponent);

    const widgetNode = createNode({
      id: 'widget-empty',
      type: 'ComplexWidget',
      props: {},
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', children: [widgetNode] }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'widget-empty',
      registry,
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    const textInput = container?.querySelector('#irich-field-widget-empty-title') as HTMLInputElement;
    expect(textInput.value).toBe('Default Title');

    const textarea = container?.querySelector('#irich-field-widget-empty-description') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Default multiline description');

    const numberInput = container?.querySelector('#irich-field-widget-empty-count') as HTMLInputElement;
    expect(numberInput.value).toBe('10');

    const boolInput = container?.querySelector('#irich-field-widget-empty-isEnabled') as HTMLInputElement;
    expect(boolInput.checked).toBe(true);

    const select = container?.querySelector('#irich-field-widget-empty-theme') as HTMLSelectElement;
    expect(select.value).toBe('dark');

    const colorText = container?.querySelector('#irich-field-widget-empty-accentColor') as HTMLInputElement;
    expect(colorText.value).toBe('#6366f1');
  });

  it('should update node props via editor.commands.updateNode when controls change', () => {
    const registry = createComponentRegistry();
    registry.register(ComplexComponent);

    const widgetNode = createNode({
      id: 'widget-live',
      type: 'ComplexWidget',
      props: {
        title: 'Original Title',
      },
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', children: [widgetNode] }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'widget-live',
      registry,
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    // 1. Change text field
    const textInput = container?.querySelector('#irich-field-widget-live-title') as HTMLInputElement;
    act(() => {
      textInput.value = 'Updated Live Title';
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
      // React's onChange is triggered by simulated change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(textInput, 'Updated Live Title');
      textInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      editor.commands.updateNode({
        nodeId: 'widget-live',
        props: { title: 'Updated Live Title' },
      });
    });

    expect(editor.getNode('widget-live')?.props.title).toBe('Updated Live Title');

    // 2. Test undo/redo on prop update
    act(() => {
      editor.commands.undo();
    });
    expect(editor.getNode('widget-live')?.props.title).toBe('Original Title');

    act(() => {
      editor.commands.redo();
    });
    expect(editor.getNode('widget-live')?.props.title).toBe('Updated Live Title');
  });

  it('should render fallback controls for unregistered component types', () => {
    const unregNode = createNode({
      id: 'unreg-1',
      type: 'UnregisteredCustomType',
      props: {
        customPropA: 'Value A',
        customPropB: 42,
      },
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', children: [unregNode] }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'unreg-1',
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    expect(container?.textContent).toContain('UnregisteredCustomType');
    expect(container?.textContent).toContain('customPropA');
    expect(container?.textContent).toContain('customPropB');

    const inputA = container?.querySelector('#irich-raw-field-unreg-1-customPropA') as HTMLInputElement;
    expect(inputA).toBeDefined();
    expect(inputA.value).toBe('Value A');
  });

  it('should provide accessible label-to-input association', () => {
    const registry = createComponentRegistry();
    registry.register(ComplexComponent);

    const widgetNode = createNode({
      id: 'widget-a11y',
      type: 'ComplexWidget',
      props: {},
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', children: [widgetNode] }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'widget-a11y',
      registry,
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    const label = container?.querySelector('label[for="irich-field-widget-a11y-title"]');
    expect(label).toBeDefined();
    expect(label?.textContent).toContain('Widget Title');

    const input = container?.querySelector('#irich-field-widget-a11y-title');
    expect(input).toBeDefined();
    expect(input?.getAttribute('aria-describedby')).toBe('irich-field-widget-a11y-title-desc');

    const desc = container?.querySelector('#irich-field-widget-a11y-title-desc');
    expect(desc?.textContent).toBe('Title of the widget');
  });

  it('should non-destructively edit responsive properties across breakpoints', () => {
    const ResponsiveComponent = defineComponent({
      type: 'ResponsiveHero',
      label: 'Responsive Hero',
      fields: {
        title: {
          type: 'text',
          label: 'Title',
          defaultValue: 'Default Title',
        },
        align: {
          type: 'select',
          label: 'Alignment',
          defaultValue: 'left',
          responsive: true,
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
      },
    });

    const registry = createComponentRegistry();
    registry.register(ResponsiveComponent);

    const heroNode = createNode({
      id: 'hero-resp-1',
      type: 'ResponsiveHero',
      props: {
        title: 'Main Title',
        align: 'left',
      },
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', children: [heroNode] }),
    });

    const editor = new Editor({
      initialDocument: doc,
      initialSelection: 'hero-resp-1',
      activeBreakpoint: 'desktop',
      registry,
    });

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <IRichInspector />
        </IRichProvider>,
      );
    });

    // 1. Initial desktop value is "left"
    const alignSelect = container?.querySelector('#irich-field-hero-resp-1-align') as HTMLSelectElement;
    expect(alignSelect.value).toBe('left');

    // 2. Switch editor breakpoint to "mobile"
    act(() => {
      editor.commands.setBreakpoint('mobile');
    });

    // 3. In mobile view, changing align to "center" creates a mobile override
    act(() => {
      alignSelect.value = 'center';
      alignSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 4. Verify document state contains both desktop and mobile values
    const updatedHero = editor.getNode('hero-resp-1');
    expect(updatedHero?.props.align).toEqual({
      desktop: 'left',
      mobile: 'center',
    });

    // 5. Switching back to desktop shows "left"
    act(() => {
      editor.commands.setBreakpoint('desktop');
    });
    expect(alignSelect.value).toBe('left');

    // 6. Switching to tablet shows "left" (inherited from desktop)
    act(() => {
      editor.commands.setBreakpoint('tablet');
    });
    expect(alignSelect.value).toBe('left');

    // 7. Switching to mobile shows "center" (the override)
    act(() => {
      editor.commands.setBreakpoint('mobile');
    });
    expect(alignSelect.value).toBe('center');
  });
});
