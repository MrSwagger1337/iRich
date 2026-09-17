import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  IRichRenderer,
  renderDocument,
  renderNode,
  RendererRegistry,
  createRenderer,
  exampleDocument,
  exampleComponents,
  type IRichDocument,
  type IRichNode,
  type NodeRendererProps,
} from './index';

describe('@irich/renderer', () => {
  describe('RendererRegistry', () => {
    it('registers, checks, retrieves, and unregisters component renderers', () => {
      const registry = createRenderer();
      const Dummy: React.FC<NodeRendererProps> = () => <div>Dummy</div>;

      expect(registry.has('Heading')).toBe(false);
      expect(registry.get('Heading')).toBeUndefined();

      registry.register('Heading', Dummy);
      expect(registry.has('Heading')).toBe(true);
      expect(registry.get('Heading')).toBe(Dummy);
      expect(Object.keys(registry.getAll())).toContain('Heading');

      expect(registry.unregister('Heading')).toBe(true);
      expect(registry.has('Heading')).toBe(false);
      expect(registry.unregister('Heading')).toBe(false);
    });

    it('clears all registered components', () => {
      const registry = new RendererRegistry({
        Hero: () => <div>Hero</div>,
        Card: () => <div>Card</div>,
      });

      expect(registry.has('Hero')).toBe(true);
      expect(registry.has('Card')).toBe(true);

      registry.clear();
      expect(registry.has('Hero')).toBe(false);
      expect(registry.has('Card')).toBe(false);
      expect(Object.keys(registry.getAll())).toHaveLength(0);
    });
  });

  describe('<IRichRenderer /> Component Rendering', () => {
    it('renders simple component with props and children', () => {
      const Button: React.FC<NodeRendererProps<{ label?: string }>> = ({ label, id }) => (
        <button id={id} data-testid="test-btn">
          {label}
        </button>
      );

      const Section: React.FC<NodeRendererProps<{ title?: string }>> = ({
        title,
        children,
        id,
      }) => (
        <section id={id} data-testid="test-section">
          <h2>{title}</h2>
          {children}
        </section>
      );

      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root-node',
          type: 'root',
          props: {},
          children: [
            {
              id: 'sec-1',
              type: 'Section',
              props: { title: 'Section Title' },
              children: [
                {
                  id: 'btn-1',
                  type: 'Button',
                  props: { label: 'Click Me' },
                },
              ],
            },
          ],
        },
      };

      const html = renderToString(
        <IRichRenderer
          document={doc}
          components={{
            Section,
            Button,
          }}
        />,
      );

      expect(html).toContain('Section Title');
      expect(html).toContain('Click Me');
      expect(html).toContain('id="sec-1"');
      expect(html).toContain('id="btn-1"');
    });

    it('renders named multi-zone layout slots correctly', () => {
      const SplitLayout: React.FC<NodeRendererProps> = ({ slots, id }) => (
        <div id={id} className="split-layout">
          <div className="slot-left">{slots?.left}</div>
          <div className="slot-right">{slots?.right}</div>
        </div>
      );

      const TextBlock: React.FC<NodeRendererProps<{ text?: string }>> = ({ text }) => (
        <p>{text}</p>
      );

      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root-1',
          type: 'root',
          props: {},
          children: [
            {
              id: 'split-1',
              type: 'SplitLayout',
              props: {},
              slots: {
                left: [{ id: 'text-left', type: 'TextBlock', props: { text: 'Left Content' } }],
                right: [{ id: 'text-right', type: 'TextBlock', props: { text: 'Right Content' } }],
              },
            },
          ],
        },
      };

      const html = renderToString(
        <IRichRenderer
          document={doc}
          components={{
            SplitLayout,
            TextBlock,
          }}
        />,
      );

      expect(html).toContain('Left Content');
      expect(html).toContain('Right Content');
      expect(html).toContain('class="slot-left"');
      expect(html).toContain('class="slot-right"');
    });

    it('works with RendererRegistry instance as components prop', () => {
      const registry = new RendererRegistry({
        Hero: ({ id }) => <header id={id}>Hero Header</header>,
      });

      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root-1',
          type: 'root',
          props: {},
          children: [{ id: 'hero-1', type: 'Hero', props: {} }],
        },
      };

      const html = renderToString(<IRichRenderer document={doc} components={registry} />);
      expect(html).toContain('Hero Header');
    });

    it('renders optional wrapper container with className and style', () => {
      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root-1',
          type: 'root',
          props: {},
          children: [{ id: 'text-1', type: 'Text', props: { content: 'Content' } }],
        },
      };

      const html = renderToString(
        <IRichRenderer
          document={doc}
          components={{ Text: ({ content }) => <span>{content as string}</span> }}
          className="custom-wrapper"
          style={{ padding: 20 }}
        />,
      );

      expect(html).toContain('class="custom-wrapper"');
      expect(html).toContain('style="padding:20px"');
      expect(html).toContain('<span>Content</span>');
    });

    it('returns null if document or root is empty', () => {
      expect(
        renderToString(
          <IRichRenderer document={null as unknown as IRichDocument} components={{}} />,
        ),
      ).toBe('');
      expect(
        renderToString(
          <IRichRenderer document={{ version: '1.0.0' } as unknown as IRichDocument} components={{}} />,
        ),
      ).toBe('');
    });
  });

  describe('Unknown Component Strategies', () => {
    const docWithUnknown: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root-1',
        type: 'root',
        props: {},
        children: [{ id: 'unregistered-1', type: 'UnregisteredWidget', props: {} }],
      },
    };

    it('renders default fallback in development environment', () => {
      const html = renderToString(
        <IRichRenderer
          document={docWithUnknown}
          components={{ Known: () => <div>Known</div> }}
          onUnknownComponent="fallback"
        />,
      );

      expect(html).toContain('Unregistered component type');
      expect(html).toContain('UnregisteredWidget');
    });

    it('renders custom fallback component when supplied', () => {
      const CustomFallback: React.FC<{ node: IRichNode }> = ({ node }) => (
        <div className="custom-fallback">Missing: {node.type}</div>
      );

      const html = renderToString(
        <IRichRenderer
          document={docWithUnknown}
          components={{}}
          fallback={CustomFallback}
        />,
      );

      expect(html).toContain('class="custom-fallback"');
      expect(html).toContain('Missing:');
      expect(html).toContain('UnregisteredWidget');
    });

    it('ignores unknown component when onUnknownComponent is "ignore"', () => {
      const html = renderToString(
        <IRichRenderer
          document={docWithUnknown}
          components={{}}
          onUnknownComponent="ignore"
        />,
      );

      expect(html).toBe('');
    });

    it('throws error when onUnknownComponent is "throw"', () => {
      expect(() => {
        renderToString(
          <IRichRenderer
            document={docWithUnknown}
            components={{ Known: () => null }}
            onUnknownComponent="throw"
          />,
        );
      }).toThrow(/Unregistered component type "UnregisteredWidget"/);
    });

    it('executes custom function for onUnknownComponent', () => {
      const html = renderToString(
        <IRichRenderer
          document={docWithUnknown}
          components={{}}
          onUnknownComponent={(node) => <em>Custom: {node.id}</em>}
        />,
      );

      expect(html).toContain('Custom:');
      expect(html).toContain('unregistered-1');
    });

    it('forwards error to onError handler when onUnknownComponent throws with onError', () => {
      const onError = vi.fn();

      const html = renderToString(
        <IRichRenderer
          document={docWithUnknown}
          components={{}}
          onUnknownComponent="throw"
          onError={onError}
        />,
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ id: 'unregistered-1', type: 'UnregisteredWidget' }),
      );
      expect(html).toBe('');
    });
  });

  describe('Functional Helpers: renderDocument & renderNode', () => {
    it('renders document via renderDocument helper', () => {
      const doc: IRichDocument = {
        version: '1.0.0',
        root: {
          id: 'root-1',
          type: 'root',
          props: {},
          children: [{ id: 'h-1', type: 'Header', props: { text: 'Hello' } }],
        },
      };

      const element = renderDocument(doc, {
        Header: ({ text }) => <h1>{text as string}</h1>,
      });

      const html = renderToString(element!);
      expect(html).toContain('<h1>Hello</h1>');
    });

    it('renders single node via renderNode helper', () => {
      const node: IRichNode = {
        id: 'card-99',
        type: 'Card',
        props: { title: 'Card 99' },
      };

      const element = renderNode(node, {
        Card: ({ title }) => <div>{title as string}</div>,
      });

      const html = renderToString(element!);
      expect(html).toContain('<div>Card 99</div>');
    });
  });

  describe('SSR Compatibility with Example Document (Page, Container, Hero, Card)', () => {
    it('renders complete example document containing Page, Container, Hero, Card to string', () => {
      const html = renderToString(
        <IRichRenderer
          document={exampleDocument}
          components={exampleComponents}
        />,
      );

      // Verify all components rendered without error
      expect(html).toContain('data-testid="page-component"');
      expect(html).toContain('data-testid="hero-component"');
      expect(html).toContain('data-testid="container-component"');
      expect(html).toContain('data-testid="card-component"');

      // Verify specific props rendered
      expect(html).toContain('Design Without Limits');
      expect(html).toContain('Component Engine');
      expect(html).toContain('SSR Compatible');
      expect(html).toContain('Plugin System');

      // Verify stable node IDs
      expect(html).toContain('id="page-1"');
      expect(html).toContain('id="hero-1"');
      expect(html).toContain('id="container-1"');
      expect(html).toContain('id="card-1"');
      expect(html).toContain('id="card-2"');
      expect(html).toContain('id="card-3"');
    });
  });
});
