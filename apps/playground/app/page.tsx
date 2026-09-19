'use client';

import React, { useMemo } from 'react';
import {
  IRichProvider,
  useIRichBreakpoint,
} from '@irich/react';
import { Canvas } from './components/canvas';
import { Inspector } from './components/inspector';
import { Palette } from './components/palette';
import { createPlaygroundRegistry } from './components/registry';
import { createPlaygroundSampleDocument } from './components/sample-document';
import { Toolbar } from './components/toolbar';

function PlaygroundWorkspace() {
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();

  return (
    <div className="irich-app-container">
      {/* Top Header Toolbar */}
      <Toolbar viewport={breakpoint} onViewportChange={setBreakpoint} />

      {/* 3-Column Editor Shell */}
      <div className="irich-main-workspace">
        {/* Left: Component Palette */}
        <Palette />

        {/* Center: Central Canvas */}
        <Canvas viewport={breakpoint} />

        {/* Right: Property Inspector */}
        <Inspector />
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const registry = useMemo(() => createPlaygroundRegistry(), []);
  const initialDocument = useMemo(() => createPlaygroundSampleDocument(), []);

  return (
    <IRichProvider initialDocument={initialDocument} config={{ registry }}>
      <PlaygroundWorkspace />
    </IRichProvider>
  );
}

