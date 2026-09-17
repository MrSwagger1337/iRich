/**
 * @irich/react
 * Dynamic Property Inspector component.
 * Dynamically generates accessible controls from registered component schemas.
 */

import { useCallback, useState, type FC } from 'react';
import type { JSONValue } from '@irich/core';
import { useIRichEditor, useIRichNode, useIRichSelection } from '../hooks';
import { RenderFieldControl } from './fields';
import type { IRichInspectorProps } from './types';

/**
 * Sensible default empty state when no component is selected.
 */
export const DefaultInspectorEmptyState: FC = () => {
  return (
    <div className="irich-inspector-empty" data-testid="irich-inspector-empty">
      <div className="irich-inspector-empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <h3 className="irich-inspector-empty-title">Properties Inspector</h3>
      <p className="irich-inspector-empty-desc">
        Select a component on the canvas to inspect and edit its properties.
      </p>
    </div>
  );
};

/**
 * Root dynamic property inspector.
 */
export const IRichInspector: FC<IRichInspectorProps> = ({
  className,
  style,
  emptyState,
  renderHeader,
  renderFooter,
  onPropChange,
}) => {
  const editor = useIRichEditor();
  const { selectedNodeId, selectNode, clearSelection } = useIRichSelection();
  const selectedNode = useIRichNode(selectedNodeId);
  const [copied, setCopied] = useState(false);

  const registry = editor.getRegistry();
  const componentDef = selectedNode ? registry?.get(selectedNode.type) : undefined;

  const handleFieldChange = useCallback(
    (fieldName: string, value: JSONValue) => {
      if (!selectedNode) return;

      editor.commands.updateNode({
        nodeId: selectedNode.id,
        props: {
          [fieldName]: value,
        },
      });

      onPropChange?.(fieldName, value, selectedNode);
    },
    [editor, selectedNode, onPropChange],
  );

  const handleDuplicate = useCallback(() => {
    if (!selectedNode) return;
    const newId = editor.commands.duplicateNode(selectedNode.id);
    selectNode(newId);
  }, [editor, selectedNode, selectNode]);

  const handleDelete = useCallback(() => {
    if (!selectedNode) return;
    const idToDelete = selectedNode.id;
    clearSelection();
    editor.commands.removeNode(idToDelete);
  }, [editor, selectedNode, clearSelection]);

  const handleCopyId = useCallback(() => {
    if (!selectedNode) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(selectedNode.id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [selectedNode]);

  if (!selectedNodeId || !selectedNode) {
    return (
      <aside
        className={`irich-inspector-container irich-inspector-no-selection ${className ?? ''}`}
        style={style}
        data-testid="irich-inspector"
      >
        {emptyState ?? <DefaultInspectorEmptyState />}
      </aside>
    );
  }

  return (
    <aside
      className={`irich-inspector-container ${className ?? ''}`}
      style={style}
      data-testid="irich-inspector"
    >
      {/* 1. Header */}
      {renderHeader ? (
        renderHeader({
          node: selectedNode,
          componentDefinition: componentDef,
          selectedNodeId,
        })
      ) : (
        <div className="irich-inspector-header">
          <div className="irich-inspector-title-row">
            <span className="irich-inspector-type-badge">{selectedNode.type}</span>
            <div className="irich-inspector-actions">
              <button
                type="button"
                className="irich-inspector-tool-btn"
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
                className="irich-inspector-tool-btn irich-inspector-tool-btn-danger"
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
                className="irich-inspector-tool-btn"
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
              className="irich-inspector-id-btn"
              onClick={handleCopyId}
              title="Click to copy node ID"
            >
              <code>{selectedNode.id}</code>
              <span>{copied ? '✓' : '⧉'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Schema-Driven Property Form */}
      <div className="irich-inspector-form">
        <div className="irich-inspector-section-title">Properties</div>

        {componentDef && componentDef.fields && Object.keys(componentDef.fields).length > 0 ? (
          Object.entries(componentDef.fields).map(([fieldName, fieldDef]) => {
            const inputId = `irich-field-${selectedNode.id}-${fieldName}`;

            // Resolve value with fallback
            const currentValue =
              selectedNode.props && selectedNode.props[fieldName] !== undefined
                ? selectedNode.props[fieldName]
                : fieldDef.defaultValue !== undefined
                  ? fieldDef.defaultValue
                  : fieldDef.type === 'number'
                    ? 0
                    : fieldDef.type === 'boolean'
                      ? false
                      : fieldDef.type === 'color'
                        ? '#000000'
                        : '';

            return (
              <RenderFieldControl
                key={fieldName}
                node={selectedNode}
                fieldName={fieldName}
                fieldDefinition={fieldDef}
                value={currentValue}
                inputId={inputId}
                onChange={(nextVal) => handleFieldChange(fieldName, nextVal)}
              />
            );
          })
        ) : (
          /* Fallback for unregistered components or components with no declared fields */
          <div className="irich-inspector-raw-props">
            {selectedNode.props && Object.keys(selectedNode.props).length > 0 ? (
              Object.entries(selectedNode.props).map(([propKey, propVal]) => {
                const inputId = `irich-raw-field-${selectedNode.id}-${propKey}`;
                return (
                  <div key={propKey} className="irich-inspector-field">
                    <label htmlFor={inputId} className="irich-inspector-label">
                      {propKey}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      className="irich-inspector-input"
                      value={typeof propVal === 'object' ? JSON.stringify(propVal) : String(propVal)}
                      onChange={(e) => handleFieldChange(propKey, e.target.value)}
                    />
                  </div>
                );
              })
            ) : (
              <p className="irich-inspector-no-props">No configurable properties declared.</p>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer */}
      {renderFooter &&
        renderFooter({
          node: selectedNode,
          componentDefinition: componentDef,
          selectedNodeId,
        })}
    </aside>
  );
};
