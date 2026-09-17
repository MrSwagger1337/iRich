/**
 * Component Palette Sidebar for iRich Playground.
 */

'use client';

import React, { useMemo } from 'react';
import { createNode } from '@irich/core';
import { useIRichEditor, useIRichSelection } from '@irich/react';
import { playgroundComponentsList } from './registry';

const categoryOrder = ['Layout', 'Content', 'Marketing'];

const iconMap: Record<string, React.ReactNode> = {
  Container: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  Heading: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 12h12" />
      <path d="M6 4v16" />
      <path d="M18 4v16" />
    </svg>
  ),
  Text: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Button: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="6" width="16" height="12" rx="3" />
      <path d="m10 12 4-2v4l-4-2Z" />
    </svg>
  ),
  Card: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Hero: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  ),
};

export function Palette() {
  const editor = useIRichEditor();
  const { selectedNodeId, selectNode } = useIRichSelection();

  // Group components by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof playgroundComponentsList>();
    for (const comp of playgroundComponentsList) {
      const cat = comp.category || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(comp);
    }
    return map;
  }, []);

  const handleInsert = (type: string) => {
    const timestamp = Date.now().toString(36).slice(-4);
    const newId = `${type.toLowerCase()}-${timestamp}`;

    const registry = editor.getRegistry();
    const defaultProps = registry ? registry.getDefaultProps(type) : {};

    const newNode = createNode({
      id: newId,
      type,
      props: defaultProps,
      children: type === 'Container' ? [] : undefined,
    });

    // Check if a container is currently selected to insert into it
    let targetParentId = 'root';
    if (selectedNodeId) {
      const selectedNode = editor.getNode(selectedNodeId);
      if (selectedNode?.type === 'Container' || selectedNode?.type === 'root') {
        targetParentId = selectedNodeId;
      }
    }

    editor.commands.insertNode({
      node: newNode,
      parentId: targetParentId,
    });

    // Select the new node
    selectNode(newId);
  };

  return (
    <aside className="irich-sidebar irich-palette-sidebar">
      <div className="irich-sidebar-header">
        <h2 className="irich-sidebar-title">Components</h2>
        <span className="irich-sidebar-subtitle">Click to add to canvas</span>
      </div>

      <div className="irich-palette-scroll">
        {categoryOrder.map((category) => {
          const components = categories.get(category);
          if (!components || components.length === 0) return null;

          return (
            <div key={category} className="irich-palette-category">
              <div className="irich-category-header">
                <span className="irich-category-name">{category}</span>
                <span className="irich-category-count">{components.length}</span>
              </div>

              <div className="irich-palette-list">
                {components.map((comp) => {
                  const icon = iconMap[comp.type] || iconMap.Card;
                  return (
                    <div
                      key={comp.type}
                      className="irich-palette-item"
                      onClick={() => handleInsert(comp.type)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleInsert(comp.type);
                        }
                      }}
                    >
                      <div className="irich-palette-item-icon">{icon}</div>
                      <div className="irich-palette-item-info">
                        <div className="irich-palette-item-title">{comp.label}</div>
                        <div className="irich-palette-item-desc">{comp.description}</div>
                      </div>
                      <button
                        type="button"
                        className="irich-palette-add-btn"
                        title={`Insert ${comp.label}`}
                        aria-label={`Insert ${comp.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsert(comp.type);
                        }}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
