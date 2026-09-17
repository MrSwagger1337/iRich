/**
 * @irich/react
 * IRichEditor placeholder component.
 */

import type { FC } from 'react';

export interface IRichEditorProps {
  /**
   * Optional custom CSS class name.
   */
  className?: string;
}

/**
 * Visual editor container placeholder component.
 */
export const IRichEditor: FC<IRichEditorProps> = ({ className }) => {
  return (
    <div
      className={className ? `irich-editor ${className}` : 'irich-editor'}
      data-testid="irich-editor"
    >
      iRich Editor Placeholder
    </div>
  );
};
