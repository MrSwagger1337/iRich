/**
 * @irich/react
 * Root Drag and Drop provider coordinating canvas and palette interactions.
 */

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  canPlaceNode,
  createNode,
  findNodeById,
  type IRichNode,
} from '@irich/core';
import { useIRichDocument, useIRichEditor, useIRichSelection } from '../hooks';
import { IRichDndContext } from './hooks';
import type {
  DropTargetData,
  IRichDndProviderProps,
  IRichDndState,
  IRichDragData,
} from './types';

/**
 * Default preview card rendered in the DragOverlay when dragging a component.
 */
function DefaultDragOverlay({
  data,
  isAllowed,
  reason,
}: {
  data: IRichDragData;
  isAllowed: boolean;
  reason?: string;
}) {
  const isPalette = data.type === 'palette-item';
  const title = isPalette ? data.label ?? data.componentType : data.componentType;
  const subtitle = isPalette ? 'New Component' : `#${data.nodeId}`;

  return (
    <div
      className={`irich-drag-overlay-card ${
        isAllowed ? 'irich-drag-valid' : 'irich-drag-invalid'
      }`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        backgroundColor: '#18181b',
        color: '#f4f4f5',
        borderRadius: '8px',
        border: `1px solid ${isAllowed ? '#6366f1' : '#f43f5e'}`,
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
        fontSize: '13px',
        fontWeight: 500,
        pointerEvents: 'none',
        zIndex: 9999,
        minWidth: '160px',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isAllowed ? '#10b981' : '#f43f5e',
          flexShrink: 0,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: '11px', color: '#a1a1aa' }}>{subtitle}</span>
      </div>
      <div
        style={{
          marginLeft: 'auto',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: isAllowed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
          color: isAllowed ? '#34d399' : '#fb7185',
        }}
      >
        {isAllowed ? 'Drop to Insert' : reason ?? 'Invalid Target'}
      </div>
    </div>
  );
}

export function IRichDndProvider({
  children,
  renderDragOverlay,
  activationDistance = 5,
  onDropSuccess,
}: IRichDndProviderProps) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectNode } = useIRichSelection();

  const [dndState, setDndState] = useState<IRichDndState>({
    activeData: null,
    overTarget: null,
    isAllowed: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const registry = editor.getRegistry();

  /**
   * Helper to evaluate drop validity given active drag data and target drop data.
   */
  const evaluatePlacement = (
    active: IRichDragData | null,
    target: DropTargetData | null,
  ): { isAllowed: boolean; reason?: string } => {
    if (!active || !target) {
      return { isAllowed: true };
    }

    const source: IRichNode | string =
      active.type === 'canvas-node'
        ? findNodeById(document, active.nodeId) ?? active.componentType
        : active.componentType;

    const result = canPlaceNode({
      document,
      source,
      targetParentId: target.parentId,
      targetSlot: target.slot,
      targetIndex: target.index,
      registry,
    });

    return {
      isAllowed: result.allowed,
      reason: result.reason,
    };
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current as IRichDragData | undefined;
    if (!activeData) return;

    setDndState({
      activeData,
      overTarget: null,
      isAllowed: true,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeData = event.active.data.current as IRichDragData | undefined;
    const overTarget = event.over?.data.current as DropTargetData | undefined;

    if (!activeData) return;

    const { isAllowed, reason } = evaluatePlacement(activeData, overTarget ?? null);

    setDndState({
      activeData,
      overTarget: overTarget ?? null,
      isAllowed,
      reason,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeData = event.active.data.current as IRichDragData | undefined;
    const overTarget = event.over?.data.current as DropTargetData | undefined;

    if (!activeData || !overTarget) {
      setDndState({ activeData: null, overTarget: null, isAllowed: true });
      return;
    }

    const { isAllowed } = evaluatePlacement(activeData, overTarget);

    if (isAllowed) {
      const targetParentId = overTarget.parentId;
      const targetSlot = overTarget.slot;
      const targetIndex = overTarget.index;

      if (activeData.type === 'palette-item') {
        // 1. Insert new node from palette
        const timestamp = Date.now().toString(36).slice(-4);
        const newId = `${activeData.componentType.toLowerCase()}-${timestamp}`;
        const defaultProps = registry ? registry.getDefaultProps(activeData.componentType) : {};
        const def = registry?.get(activeData.componentType);

        const canHaveChildren = def ? def.canHaveChildren !== false : false;

        const newNode = createNode({
          id: newId,
          type: activeData.componentType,
          props: defaultProps,
          children: canHaveChildren ? [] : undefined,
        });

        editor.commands.insertNode({
          node: newNode,
          parentId: targetParentId,
          slot: targetSlot,
          index: targetIndex,
        });

        selectNode(newId);

        onDropSuccess?.({
          source: activeData,
          targetParentId,
          targetSlot,
          targetIndex,
        });
      } else if (activeData.type === 'canvas-node') {
        // 2. Move existing canvas node
        const isSamePosition =
          activeData.parentId === targetParentId &&
          activeData.slot === targetSlot &&
          (targetIndex === undefined || activeData.index === targetIndex);

        if (!isSamePosition) {
          editor.commands.moveNode({
            nodeId: activeData.nodeId,
            targetParentId,
            targetSlot,
            targetIndex,
          });

          selectNode(activeData.nodeId);

          onDropSuccess?.({
            source: activeData,
            targetParentId,
            targetSlot,
            targetIndex,
          });
        }
      }
    }

    setDndState({
      activeData: null,
      overTarget: null,
      isAllowed: true,
    });
  };

  const handleDragCancel = () => {
    setDndState({
      activeData: null,
      overTarget: null,
      isAllowed: true,
    });
  };

  const contextValue = useMemo(() => dndState, [dndState]);

  return (
    <IRichDndContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}

        <DragOverlay dropAnimation={null}>
          {dndState.activeData ? (
            renderDragOverlay ? (
              renderDragOverlay(dndState.activeData, dndState.isAllowed)
            ) : (
              <DefaultDragOverlay
                data={dndState.activeData}
                isAllowed={dndState.isAllowed}
                reason={dndState.reason}
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </IRichDndContext.Provider>
  );
}
