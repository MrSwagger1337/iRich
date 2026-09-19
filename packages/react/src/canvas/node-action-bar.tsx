/**
 * @irich/react
 * Reusable floating action toolbar for selected canvas nodes with drag handle, move, duplicate, and delete.
 */

import type { IRichNodeActionBarProps } from './types';

/**
 * Standard node actions toolbar for selected canvas nodes.
 */
export function IRichNodeActionBar({
  state,
  dragHandleProps,
  className = '',
}: IRichNodeActionBarProps) {
  const { nodeType, canMoveUp, canMoveDown, canDuplicate, canDelete, moveUp, moveDown, duplicate, remove } =
    state;

  return (
    <div
      className={`irich-node-actions ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      data-irich-node-actions="true"
    >
      {/* Intentional Drag Handle (Fulfills Amendment 1) */}
      <div
        className="irich-node-action-grip"
        title="Drag to reorder or move into container"
        aria-label="Drag Handle"
        role="button"
        tabIndex={0}
        {...dragHandleProps}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.8" />
          <circle cx="15" cy="6" r="1.8" />
          <circle cx="9" cy="12" r="1.8" />
          <circle cx="15" cy="12" r="1.8" />
          <circle cx="9" cy="18" r="1.8" />
          <circle cx="15" cy="18" r="1.8" />
        </svg>
      </div>

      <span className="irich-node-actions-type">{nodeType}</span>

      <div className="irich-node-actions-divider" />

      {/* Move Up */}
      <button
        type="button"
        onClick={moveUp}
        disabled={!canMoveUp}
        className="irich-node-action-btn"
        title="Move Up"
        aria-label="Move Up"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Move Down */}
      <button
        type="button"
        onClick={moveDown}
        disabled={!canMoveDown}
        className="irich-node-action-btn"
        title="Move Down"
        aria-label="Move Down"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Duplicate */}
      <button
        type="button"
        onClick={duplicate}
        disabled={!canDuplicate}
        className="irich-node-action-btn"
        title="Duplicate"
        aria-label="Duplicate"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={remove}
        disabled={!canDelete}
        className="irich-node-action-btn irich-node-action-delete"
        title="Delete"
        aria-label="Delete"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
