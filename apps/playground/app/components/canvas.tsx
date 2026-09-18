/**
 * Central Canvas Area for iRich Playground.
 */

'use client';

import React from 'react';
import { useIRichDocument, useIRichSelection } from '@irich/react';
import { IRichRenderer } from '@irich/renderer';
import { playgroundComponentRenderers } from './renderers';
import type { ViewportMode } from './toolbar';

interface CanvasProps {
  viewport: ViewportMode;
}

const viewportWidthMap: Record<ViewportMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const viewportLabelMap: Record<ViewportMode, string> = {
  desktop: 'Desktop (Responsive 100%)',
  tablet: 'Tablet (768px)',
  mobile: 'Mobile (375px)',
};

export function Canvas({ viewport }: CanvasProps) {
  const document = useIRichDocument();
  const { clearSelection } = useIRichSelection();

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicked on the canvas backdrop itself
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <main className="irich-canvas-viewport" onClick={handleCanvasClick}>
      {/* Device Indicator Bar */}
      <div className="irich-canvas-device-bar">
        <span className="irich-canvas-device-label">{viewportLabelMap[viewport]}</span>
      </div>

      {/* Frame Container */}
      <div
        className={`irich-canvas-frame irich-canvas-frame-${viewport}`}
        style={{ width: viewportWidthMap[viewport] }}
      >
        <div className="irich-canvas-paper">
          <IRichRenderer
            document={document}
            components={playgroundComponentRenderers}
            breakpoint={viewport}
            onUnknownComponent="fallback"
          />
        </div>
      </div>
    </main>
  );
}
