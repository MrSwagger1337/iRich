/**
 * Property Inspector Sidebar for iRich Playground.
 */

'use client';

import React, { useState } from 'react';
import type { IRichNode, JSONValue } from '@irich/core';
import {
  useIRichDocument,
  useIRichEditor,
  useIRichNode,
  useIRichSelection,
} from '@irich/react';

export function Inspector() {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId, selectNode, clearSelection } = useIRichSelection();
  const selectedNode = useIRichNode(selectedNodeId);
  const [copied, setCopied] = useState(false);

  const registry = editor.getRegistry();
  const componentDef = selectedNode ? registry?.get(selectedNode.type) : undefined;

  const handlePropChange = (fieldName: string, value: JSONValue) => {
    if (!selectedNodeId) return;

    editor.commands.updateNode({
      nodeId: selectedNodeId,
      props: {
        [fieldName]: value,
      },
    });
  };

  const handleDuplicate = () => {
    if (!selectedNodeId) return;
    const newId = editor.commands.duplicateNode(selectedNodeId);
    selectNode(newId);
  };

  const handleDelete = () => {
    if (!selectedNodeId) return;
    const idToDelete = selectedNodeId;
    clearSelection();
    editor.commands.removeNode(idToDelete);
  };

  const handleCopyId = () => {
    if (!selectedNodeId) return;
    navigator.clipboard.writeText(selectedNodeId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

  return (
    <aside className="irich-sidebar irich-inspector-sidebar">
      {selectedNode ? (
        <div className="irich-inspector-content">
          {/* Header */}
          <div className="irich-inspector-header">
            <div className="irich-inspector-title-row">
              <div className="irich-inspector-type-badge">{selectedNode.type}</div>
              <div className="irich-inspector-actions">
                <button
                  type="button"
                  className="irich-tool-btn irich-tool-btn-sm"
                  onClick={handleDuplicate}
                  title="Duplicate component"
                  aria-label="Duplicate component"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="irich-tool-btn irich-tool-btn-sm irich-tool-btn-danger"
                  onClick={handleDelete}
                  title="Delete component"
                  aria-label="Delete component"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="irich-tool-btn irich-tool-btn-sm"
                  onClick={clearSelection}
                  title="Close inspector"
                  aria-label="Close inspector"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="irich-inspector-meta-row">
              <span className="irich-inspector-id-label">Node ID:</span>
              <button
                type="button"
                className="irich-inspector-id-value"
                onClick={handleCopyId}
                title="Click to copy ID"
              >
                <code>{selectedNode.id}</code>
                <span>{copied ? '✓' : '⧉'}</span>
              </button>
            </div>
          </div>

          {/* Properties Form */}
          <div className="irich-inspector-form">
            <div className="irich-inspector-section-label">Component Properties</div>

            {componentDef && componentDef.fields ? (
              Object.entries(componentDef.fields).map(([fieldName, fieldDef]) => {
                const currentValue = selectedNode.props?.[fieldName] ?? fieldDef.defaultValue ?? '';

                return (
                  <div key={fieldName} className="irich-form-field">
                    <label className="irich-form-label" htmlFor={`prop-${fieldName}`}>
                      {fieldDef.label || fieldName}
                    </label>

                    {/* Field renderers based on fieldDef.type */}
                    {fieldDef.type === 'textarea' ? (
                      <textarea
                        id={`prop-${fieldName}`}
                        className="irich-input irich-textarea"
                        rows={3}
                        value={String(currentValue)}
                        onChange={(e) => handlePropChange(fieldName, e.target.value)}
                      />
                    ) : fieldDef.type === 'select' ? (
                      <select
                        id={`prop-${fieldName}`}
                        className="irich-input irich-select"
                        value={String(currentValue)}
                        onChange={(e) => handlePropChange(fieldName, e.target.value)}
                      >
                        {('options' in fieldDef
                          ? (fieldDef.options as Array<{ label: string; value: string | number | boolean }>)
                          : []
                        ).map((opt) => (
                          <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : fieldDef.type === 'number' ? (
                      <input
                        id={`prop-${fieldName}`}
                        type="number"
                        className="irich-input"
                        value={Number(currentValue)}
                        onChange={(e) => handlePropChange(fieldName, Number(e.target.value))}
                      />
                    ) : fieldDef.type === 'boolean' ? (
                      <label className="irich-checkbox-label">
                        <input
                          id={`prop-${fieldName}`}
                          type="checkbox"
                          className="irich-checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(e) => handlePropChange(fieldName, e.target.checked)}
                        />
                        <span>Enabled</span>
                      </label>
                    ) : (
                      <input
                        id={`prop-${fieldName}`}
                        type="text"
                        className="irich-input"
                        value={String(currentValue)}
                        onChange={(e) => handlePropChange(fieldName, e.target.value)}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              /* Fallback for components without registered field definition schemas */
              <div className="irich-props-raw">
                {Object.entries(selectedNode.props || {}).map(([key, value]) => (
                  <div key={key} className="irich-form-field">
                    <label className="irich-form-label" htmlFor={`raw-prop-${key}`}>{key}</label>
                    <input
                      id={`raw-prop-${key}`}
                      type="text"
                      className="irich-input"
                      value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      onChange={(e) => handlePropChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
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
      )}
    </aside>
  );
}
