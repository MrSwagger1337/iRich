/**
 * Editor top toolbar with navigation, history controls, viewport switcher, fixture selector,
 * UI direction toggles, and document utilities.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { Breakpoint } from '@irich/core';
import {
  useIRichBreakpoint,
  useIRichDocument,
  useIRichHistory,
  useIRichUIDirection,
} from '@irich/react';

interface EditorToolbarProps {
  isSaving: boolean;
  currentFixture: 'english' | 'arabic';
  onSwitchFixture: (fixture: 'english' | 'arabic') => void;
  onOpenJsonModal: () => void;
  onResetDraft: () => void;
}

const VIEWPORT_OPTIONS: { id: Breakpoint; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet · 768px' },
  { id: 'mobile', label: 'Mobile · 375px' },
];

export function EditorToolbar({
  isSaving,
  currentFixture,
  onSwitchFixture,
  onOpenJsonModal,
  onResetDraft,
}: EditorToolbarProps) {
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();
  const { canUndo, canRedo, undo, redo } = useIRichHistory();
  const { uiDirection, setUIDirection } = useIRichUIDirection();
  const document = useIRichDocument();

  const docDir = document.metadata?.direction ?? 'auto';

  return (
    <header className="irich-editor-toolbar">
      {/* Left: Navigation & History & Save Status */}
      <div className="irich-toolbar-group">
        <Link href="/" className="irich-btn irich-btn-ghost irich-btn-sm" title="Return to Published Page">
          ← Published View
        </Link>

        <div className="irich-toolbar-divider" />

        {/* Undo / Redo */}
        <div className="irich-history-buttons">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Undo (Ctrl/Cmd+Z)"
            aria-label="Undo"
          >
            ↺ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            aria-label="Redo"
          >
            ↻ Redo
          </button>
        </div>

        {/* Save Status */}
        <span className="irich-save-status">
          <span
            className="irich-status-dot"
            style={{ background: isSaving ? '#fbbf24' : '#10b981' }}
          />
          {isSaving ? 'Saving...' : 'Saved'}
        </span>
      </div>

      {/* Center: Fixture Switcher, Breakpoints & UI Direction */}
      <div className="irich-toolbar-group">
        {/* Sample Fixture Selector */}
        <div className="irich-viewport-controls" role="group" aria-label="Sample Document Selector">
          <button
            type="button"
            onClick={() => onSwitchFixture('english')}
            className={`irich-viewport-btn ${currentFixture === 'english' ? 'active' : ''}`}
            aria-pressed={currentFixture === 'english'}
            title="Switch to English LTR Landing Page fixture"
          >
            🇬🇧 English LTR
          </button>
          <button
            type="button"
            onClick={() => onSwitchFixture('arabic')}
            className={`irich-viewport-btn ${currentFixture === 'arabic' ? 'active' : ''}`}
            aria-pressed={currentFixture === 'arabic'}
            title="Switch to Arabic RTL Article fixture"
          >
            🇸🇦 Arabic RTL
          </button>
        </div>

        <div className="irich-toolbar-divider" />

        {/* Viewport Breakpoints */}
        <div className="irich-viewport-controls" role="group" aria-label="Responsive Viewport Switcher">
          {VIEWPORT_OPTIONS.map((opt) => {
            const isActive = breakpoint === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBreakpoint(opt.id)}
                className={`irich-viewport-btn ${isActive ? 'active' : ''}`}
                aria-pressed={isActive}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="irich-toolbar-divider" />

        {/* UI Direction Toggle */}
        <div className="irich-viewport-controls" role="group" aria-label="Editor Chrome UI Direction">
          <button
            type="button"
            onClick={() => setUIDirection('ltr')}
            className={`irich-viewport-btn ${uiDirection === 'ltr' ? 'active' : ''}`}
            aria-pressed={uiDirection === 'ltr'}
            title="Set Editor Studio UI to LTR layout"
          >
            UI: LTR
          </button>
          <button
            type="button"
            onClick={() => setUIDirection('rtl')}
            className={`irich-viewport-btn ${uiDirection === 'rtl' ? 'active' : ''}`}
            aria-pressed={uiDirection === 'rtl'}
            title="Set Editor Studio UI to RTL layout"
          >
            UI: RTL
          </button>
        </div>
      </div>

      {/* Right: Document Direction Badge & Utilities */}
      <div className="irich-toolbar-group">
        <span
          className="irich-badge-tag"
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
          title={`Document direction is ${docDir.toUpperCase()}`}
        >
          Doc: {docDir.toUpperCase()}
        </span>

        <button
          type="button"
          onClick={onResetDraft}
          className="irich-btn irich-btn-ghost irich-btn-sm"
          title="Reset editor draft to sample fixture"
        >
          Reset Draft
        </button>

        <button
          type="button"
          onClick={onOpenJsonModal}
          className="irich-btn irich-btn-secondary irich-btn-sm"
          title="Inspect Canonical JSON Document"
        >
          JSON State
        </button>
      </div>
    </header>
  );
}

