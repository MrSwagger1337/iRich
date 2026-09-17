/**
 * @irich/renderer
 * Default visual fallback for unmapped / unknown component types.
 */

import React from 'react';
import type { UnknownComponentProps } from './types';

export const DefaultUnknownComponent: React.FC<UnknownComponentProps> = ({
  node,
  availableComponents,
}) => {
  const isDev =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV !== 'production';

  if (!isDev) {
    return null;
  }

  return (
    <div
      data-irich-unknown-component={node.type}
      style={{
        padding: '12px 16px',
        margin: '8px 0',
        backgroundColor: '#fef2f2',
        border: '1px dashed #ef4444',
        borderRadius: '6px',
        color: '#991b1b',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600 }}>
        [iRich Renderer Warning] Unregistered component type: &quot;{node.type}&quot; (ID: {node.id})
      </div>
      {availableComponents.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#b91c1c' }}>
          Available components: {availableComponents.join(', ')}
        </div>
      )}
    </div>
  );
};
