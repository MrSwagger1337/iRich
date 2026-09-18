'use client';

import React, { useMemo, useState } from 'react';
import { IRichDndProvider, IRichProvider } from '@irich/react';
import { Canvas } from './components/canvas';
import { Inspector } from './components/inspector';
import { Palette } from './components/palette';
import { createPlaygroundRegistry } from './components/registry';
import { createPlaygroundSampleDocument } from './components/sample-document';
import { Toolbar, type ViewportMode } from './components/toolbar';

export default function PlaygroundPage() {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  const registry = useMemo(() => createPlaygroundRegistry(), []);
  const initialDocument = useMemo(() => createPlaygroundSampleDocument(), []);

  return (
    <IRichProvider initialDocument={initialDocument} config={{ registry }}>
      <IRichDndProvider>
        <div className="irich-app-container">
          {/* Top Header Toolbar */}
          <Toolbar viewport={viewport} onViewportChange={setViewport} />

          {/* 3-Column Editor Shell */}
          <div className="irich-main-workspace">
            {/* Left: Component Palette */}
            <Palette />

            {/* Center: Central Canvas */}
            <Canvas viewport={viewport} />

            {/* Right: Property Inspector */}
            <Inspector />
          </div>
        </div>
      </IRichDndProvider>
    </IRichProvider>
  );
}
