/**
 * Categorized Component Palette sidebar for inserting new components.
 */

'use client';

import React, { useMemo } from 'react';
import type { ComponentDefinition } from '@irich/core';
import { IRichPaletteItem } from '@irich/react';
import { canonicalComponentDefinitions } from '../app/components/definitions';

const CATEGORY_ORDER = ['Layout', 'Typography', 'Marketing', 'Interactive'];

export function ComponentPalette() {
  // Group definitions by category
  const categorized = useMemo(() => {
    const map = new Map<string, ComponentDefinition[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }

    for (const comp of canonicalComponentDefinitions) {
      const cat = comp.category || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(comp);
    }

    return Array.from(map.entries()).filter(([_, items]) => items.length > 0);
  }, []);

  return (
    <aside className="irich-editor-sidebar-left">
      <div className="irich-palette-header">
        <h2 className="irich-palette-heading">Components</h2>
        <p className="irich-palette-subtitle">Click or drag to add to page</p>
      </div>

      <div className="irich-palette-scroll">
        {categorized.map(([category, items]) => (
          <div key={category} className="irich-palette-group">
            <h3 className="irich-palette-category">{category}</h3>
            <div className="irich-palette-list">
              {items.map((comp) => (
                <IRichPaletteItem
                  key={comp.type}
                  componentType={comp.type}
                  label={comp.label}
                  description={comp.description}
                  icon="+"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

