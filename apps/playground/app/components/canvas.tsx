/**
 * Central Canvas Area for iRich Playground using canonical IRichCanvas from @irich/react.
 */

'use client';

import React, { useMemo } from 'react';
import { IRichCanvas } from '@irich/react';
import { playgroundComponentRenderers } from './renderers';
import { createPlaygroundRegistry } from './registry';
import type { ViewportMode } from './toolbar';

interface CanvasProps {
  viewport: ViewportMode;
}

export function Canvas({ viewport }: CanvasProps) {
  const registry = useMemo(() => createPlaygroundRegistry(), []);

  return (
    <IRichCanvas
      components={playgroundComponentRenderers}
      registry={registry}
      breakpoint={viewport}
      className="irich-canvas-viewport"
    />
  );
}

