/**
 * @irich/react
 * Visual insertion indicator rendered at prospective drop locations.
 */

import type { CSSProperties } from 'react';
import type { DropEdge } from './types';

export interface InsertionIndicatorProps {
  /**
   * Relative position where the drop will occur.
   */
  readonly edge: DropEdge;
  /**
   * Whether the indicator is currently visible.
   */
  readonly visible?: boolean;
  /**
   * Whether placement at this indicator is permissible.
   */
  readonly allowed?: boolean;
  /**
   * Optional custom CSS style overrides.
   */
  readonly style?: CSSProperties;
  /**
   * Optional custom CSS class name.
   */
  readonly className?: string;
}

/**
 * Visual insertion guide line or boundary box indicating where a dragged component will land.
 */
export function InsertionIndicator({
  edge,
  visible = true,
  allowed = true,
  style,
  className = '',
}: InsertionIndicatorProps) {
  if (!visible) {
    return null;
  }

  const baseClasses = `irich-drop-indicator irich-drop-indicator-${edge} ${
    allowed ? 'irich-drop-allowed' : 'irich-drop-disallowed'
  } ${className}`;

  return (
    <div
      className={baseClasses.trim()}
      style={style}
      aria-hidden="true"
      data-edge={edge}
      data-allowed={allowed ? 'true' : 'false'}
    >
      <div className="irich-drop-indicator-line" />
    </div>
  );
}
