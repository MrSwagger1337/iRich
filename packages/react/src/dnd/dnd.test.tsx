/**
 * @vitest-environment jsdom
 *
 * @irich/react
 * Unit & integration tests for Drag and Drop subsystem.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocument, createEditor } from '@irich/core';
import { IRichProvider } from '../provider';
import { InsertionIndicator } from './drop-indicator';
import { IRichDndProvider } from './provider';
import {
  useIRichCanvasDraggable,
  useIRichDndState,
  useIRichDroppableContainer,
  useIRichNodeDropTarget,
  useIRichPaletteDraggable,
} from './hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function TestPaletteItem({ componentType }: { componentType: string }) {
  const { setNodeRef, isDragging } = useIRichPaletteDraggable({
    componentType,
    label: `${componentType} Label`,
  });

  return (
    <div ref={setNodeRef} data-testid={`palette-${componentType}`} data-dragging={isDragging}>
      {componentType}
    </div>
  );
}

function TestCanvasNode({
  nodeId,
  componentType,
  parentId,
  index,
}: {
  nodeId: string;
  componentType: string;
  parentId: string;
  index: number;
}) {
  const { setNodeRef, isDragging } = useIRichCanvasDraggable({
    nodeId,
    componentType,
    parentId,
    index,
  });

  const { setNodeRef: setTopRef, isOver: isTopOver } = useIRichNodeDropTarget({
    nodeId,
    parentId,
    index,
    edge: 'top',
  });

  const { setNodeRef: setBottomRef, isOver: isBottomOver } = useIRichNodeDropTarget({
    nodeId,
    parentId,
    index,
    edge: 'bottom',
  });

  return (
    <div ref={setNodeRef} data-testid={`canvas-${nodeId}`} data-dragging={isDragging}>
      <div ref={setTopRef} data-testid={`edge-top-${nodeId}`} data-over={isTopOver} />
      <span>{componentType}</span>
      <div ref={setBottomRef} data-testid={`edge-bottom-${nodeId}`} data-over={isBottomOver} />
    </div>
  );
}

function TestContainer({ parentId }: { parentId: string }) {
  const { setNodeRef, isOver } = useIRichDroppableContainer({
    parentId,
  });
  const dndState = useIRichDndState();

  return (
    <div ref={setNodeRef} data-testid={`container-${parentId}`} data-over={isOver}>
      <span>Container {parentId}</span>
      <div data-testid="dnd-allowed">{String(dndState.isAllowed)}</div>
    </div>
  );
}

describe('Drag and Drop subsystem (@irich/react)', () => {
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

  it('renders InsertionIndicator with correct classes and data attributes', () => {
    act(() => {
      root?.render(<InsertionIndicator edge="top" allowed={true} />);
    });

    let indicator = container?.querySelector('.irich-drop-indicator');
    expect(indicator).toBeTruthy();
    expect(indicator?.classList.contains('irich-drop-indicator-top')).toBe(true);
    expect(indicator?.classList.contains('irich-drop-allowed')).toBe(true);
    expect(indicator?.getAttribute('data-edge')).toBe('top');

    act(() => {
      root?.render(<InsertionIndicator edge="bottom" allowed={false} />);
    });

    indicator = container?.querySelector('.irich-drop-indicator');
    expect(indicator?.classList.contains('irich-drop-indicator-bottom')).toBe(true);
    expect(indicator?.classList.contains('irich-drop-disallowed')).toBe(true);
    expect(indicator?.getAttribute('data-allowed')).toBe('false');

    act(() => {
      root?.render(<InsertionIndicator edge="inside" visible={false} />);
    });

    expect(container?.querySelector('.irich-drop-indicator')).toBeNull();
  });

  it('provides drag-and-drop context and hooks cleanly within IRichDndProvider', () => {
    const editor = createEditor({
      initialDocument: createDocument(),
    });

    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDndProvider>
            <TestPaletteItem componentType="Hero" />
            <TestContainer parentId="root" />
            <TestCanvasNode nodeId="hero-1" componentType="Hero" parentId="root" index={0} />
          </IRichDndProvider>
        </IRichProvider>,
      );
    });

    expect(container?.querySelector('[data-testid="palette-Hero"]')).toBeTruthy();
    expect(container?.querySelector('[data-testid="container-root"]')).toBeTruthy();
    expect(container?.querySelector('[data-testid="canvas-hero-1"]')).toBeTruthy();
    expect(container?.querySelector('[data-testid="edge-top-hero-1"]')).toBeTruthy();
    expect(container?.querySelector('[data-testid="edge-bottom-hero-1"]')).toBeTruthy();
    expect(container?.querySelector('[data-testid="dnd-allowed"]')?.textContent).toBe('true');
  });
});
