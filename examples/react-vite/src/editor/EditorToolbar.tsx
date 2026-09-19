/**
 * Top Toolbar for the Vite visual editor.
 * Provides viewport controls, undo/redo, autosave status, fixture switcher, and JSON Studio trigger.
 */

import type { Breakpoint } from '@irich/core';
import { useIRichBreakpoint, useIRichHistory } from '@irich/react';

interface EditorToolbarProps {
  isSaving: boolean;
  currentFixture: 'english' | 'arabic';
  onSwitchFixture: (fixture: 'english' | 'arabic') => void;
  onOpenJsonModal: () => void;
  onResetDraft: () => void;
  onSwitchToPreview: () => void;
}

export function EditorToolbar({
  isSaving,
  currentFixture,
  onSwitchFixture,
  onOpenJsonModal,
  onResetDraft,
  onSwitchToPreview,
}: EditorToolbarProps) {
  const { canUndo, canRedo, undo, redo } = useIRichHistory();
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();

  return (
    <header className="vite-editor-header" role="toolbar" aria-label="Editor Toolbar">
      {/* Left: View Mode & History */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <button
          type="button"
          onClick={onSwitchToPreview}
          className="vite-btn vite-btn-ghost vite-btn-sm"
          title="Switch to Live Published View"
        >
          <span style={{ marginInlineEnd: '6px' }}>←</span>
          Live Preview
        </button>

        <div style={{ height: '18px', width: '1px', background: 'var(--border)' }} />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="vite-btn vite-btn-ghost vite-btn-sm"
          style={{ opacity: canUndo ? 1 : 0.4 }}
          title="Undo (Cmd/Ctrl+Z)"
        >
          ↺ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="vite-btn vite-btn-ghost vite-btn-sm"
          style={{ opacity: canRedo ? 1 : 0.4 }}
          title="Redo (Cmd/Ctrl+Shift+Z)"
        >
          ↻ Redo
        </button>

        {/* Autosave Status */}
        <span
          style={{
            fontSize: '0.75rem',
            color: isSaving ? '#fbbf24' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginInlineStart: '0.5rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isSaving ? '#fbbf24' : '#34d399',
            }}
          />
          {isSaving ? 'Saving...' : 'Saved to LocalStorage'}
        </span>
      </div>

      {/* Center: Viewport Breakpoints & Fixture Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Breakpoints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-dark)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
          role="group"
          aria-label="Responsive Viewports"
        >
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setBreakpoint(bp)}
              className="vite-btn vite-btn-ghost vite-btn-sm"
              style={{
                background: breakpoint === bp ? 'var(--bg-surface)' : 'transparent',
                color: breakpoint === bp ? '#fff' : 'var(--text-sub)',
                fontWeight: breakpoint === bp ? 700 : 500,
                textTransform: 'capitalize',
                padding: '0.2rem 0.65rem',
              }}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Fixture Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-dark)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
          role="group"
          aria-label="Language & Direction Fixture"
        >
          <button
            type="button"
            onClick={() => onSwitchFixture('english')}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            style={{
              background: currentFixture === 'english' ? 'var(--bg-surface)' : 'transparent',
              color: currentFixture === 'english' ? '#fff' : 'var(--text-sub)',
              fontWeight: currentFixture === 'english' ? 700 : 500,
              padding: '0.2rem 0.65rem',
            }}
          >
            EN (LTR)
          </button>
          <button
            type="button"
            onClick={() => onSwitchFixture('arabic')}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            style={{
              background: currentFixture === 'arabic' ? 'var(--bg-surface)' : 'transparent',
              color: currentFixture === 'arabic' ? '#fff' : 'var(--text-sub)',
              fontWeight: currentFixture === 'arabic' ? 700 : 500,
              padding: '0.2rem 0.65rem',
            }}
          >
            AR (RTL)
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onOpenJsonModal}
          className="vite-btn vite-btn-secondary vite-btn-sm"
          title="Open Document JSON Studio"
        >
          JSON Studio
        </button>
        <button
          type="button"
          onClick={onResetDraft}
          className="vite-btn vite-btn-ghost vite-btn-sm"
          title="Reset document to initial fixture"
        >
          Reset Draft
        </button>
        <button
          type="button"
          onClick={onSwitchToPreview}
          className="vite-btn vite-btn-primary vite-btn-sm"
        >
          View Live
        </button>
      </div>
    </header>
  );
}
