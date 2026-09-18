'use client';

import { useState } from 'react';
import { resolveResponsiveValue, type Breakpoint, type ResponsiveValue } from '@irich/core';

export function ResponsiveValueDemo() {
  const [desktopVal, setDesktopVal] = useState('left');
  const [tabletVal, setTabletVal] = useState('');
  const [mobileVal, setMobileVal] = useState('center');
  const [activeBp, setActiveBp] = useState<Breakpoint>('mobile');

  const responsiveObj: ResponsiveValue<string> = {
    desktop: desktopVal,
    ...(tabletVal ? { tablet: tabletVal } : {}),
    ...(mobileVal ? { mobile: mobileVal } : {}),
  };

  const resolved = resolveResponsiveValue(responsiveObj, activeBp, 'left');

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        ⚡ Live Interactive Demo: Responsive Resolution
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Test how iRich resolves cascading fallback inheritance in real-time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Desktop (Base)
          </label>
          <input
            type="text"
            value={desktopVal}
            onChange={(e) => setDesktopVal(e.target.value)}
            style={{ width: '100%', padding: '0.4rem', background: '#020617', border: '1px solid var(--border)', borderRadius: '4px', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Tablet (Override)
          </label>
          <input
            type="text"
            placeholder="(Inherit desktop)"
            value={tabletVal}
            onChange={(e) => setTabletVal(e.target.value)}
            style={{ width: '100%', padding: '0.4rem', background: '#020617', border: '1px solid var(--border)', borderRadius: '4px', color: '#fff' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Mobile (Override)
          </label>
          <input
            type="text"
            placeholder="(Inherit)"
            value={mobileVal}
            onChange={(e) => setMobileVal(e.target.value)}
            style={{ width: '100%', padding: '0.4rem', background: '#020617', border: '1px solid var(--border)', borderRadius: '4px', color: '#fff' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Target Viewport:</span>
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              onClick={() => setActiveBp(bp)}
              style={{
                background: activeBp === bp ? 'var(--accent-primary)' : 'transparent',
                color: activeBp === bp ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: activeBp === bp ? 700 : 400,
                fontSize: '0.8125rem',
                textTransform: 'capitalize',
              }}
            >
              {bp}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Resolved Value:</span>
          <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>&ldquo;{resolved}&rdquo;</strong>
        </div>
      </div>
    </div>
  );
}
