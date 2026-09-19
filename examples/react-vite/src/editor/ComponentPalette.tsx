/**
 * Component Palette sidebar using canonical IRichPaletteItem from @irich/react.
 * Provides accessible click-to-insert and drag-to-insert capabilities.
 */

import { useMemo } from 'react';
import type { ComponentDefinition } from '@irich/core';
import { IRichPaletteItem } from '@irich/react';
import { canonicalViteComponents } from '../components/definitions';

const CATEGORY_ORDER = ['Layout', 'Typography', 'Marketing', 'Interactive'];

export function ComponentPalette() {
  const categorized = useMemo(() => {
    const map = new Map<string, ComponentDefinition[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }

    for (const comp of canonicalViteComponents) {
      if (comp.type === 'Column') continue;
      const cat = comp.category || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(comp);
    }

    return Array.from(map.entries()).filter(([_, items]) => items.length > 0);
  }, []);

  return (
    <aside className="vite-editor-sidebar-left" aria-label="Component Palette">
      <div className="vite-palette-section">
        <h3 className="vite-palette-title">Components</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Click or drag onto canvas
        </p>

        {categorized.map(([category, items]) => (
          <div key={category} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                letterSpacing: '0.05em',
              }}
            >
              {category}
            </div>
            <div className="vite-palette-grid">
              {items.map((comp) => (
                <IRichPaletteItem
                  key={comp.type}
                  componentType={comp.type}
                  label={comp.label}
                  description={comp.description}
                  icon="+"
                  className="vite-palette-item"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
