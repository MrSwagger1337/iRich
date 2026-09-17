/**
 * Property Inspector Sidebar for iRich Playground.
 * Utilizes @irich/react's IRichInspector with custom empty state outline.
 */

'use client';

import React from 'react';
import type { IRichNode } from '@irich/core';
import {
  IRichInspector,
  useIRichDocument,
  useIRichSelection,
} from '@irich/react';

export function Inspector() {
  const document = useIRichDocument();
  const { selectedNodeId, selectNode } = useIRichSelection();

  // Render tree node in outline
  const renderOutlineNode = (node: IRichNode, depth = 0) => {
    const isSelected = selectedNodeId === node.id;
    return (
      <div key={node.id} className="irich-outline-item-container">
        <button
          type="button"
          className={`irich-outline-item ${isSelected ? 'active' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          onClick={() => selectNode(node.id)}
        >
          <span className="irich-outline-icon">▪</span>
          <span className="irich-outline-type">{node.type}</span>
          <span className="irich-outline-id">#{node.id}</span>
        </button>
        {node.children?.map((child) => renderOutlineNode(child, depth + 1))}
      </div>
    );
  };

  const customEmptyState = (
    <div className="irich-inspector-empty">
      <div className="irich-empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <h3 className="irich-empty-title">Properties Inspector</h3>
      <p className="irich-empty-desc">
        Click any component on the canvas to inspect and customize its properties.
      </p>

      <div className="irich-sidebar-divider" />

      {/* Document Hierarchy Outline */}
      <div className="irich-outline-section">
        <div className="irich-inspector-section-label">Document Outline</div>
        <div className="irich-outline-list">
          {document.root ? renderOutlineNode(document.root) : null}
        </div>
      </div>
    </div>
  );

  return (
    <aside className="irich-sidebar irich-inspector-sidebar">
      <IRichInspector emptyState={customEmptyState} />
    </aside>
  );
}
