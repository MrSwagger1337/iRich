/**
 * Component Palette Sidebar for iRich Playground using canonical IRichPaletteItem from @irich/react.
 */

'use client';

import React, { useMemo } from 'react';
import { IRichPaletteItem } from '@irich/react';
import { playgroundComponentsList } from './registry';

const categoryOrder = ['Layout', 'Content', 'Marketing'];

const iconMap: Record<string, React.ReactNode> = {
  Container: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  Heading: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 12h12" />
      <path d="M6 4v16" />
      <path d="M18 4v16" />
    </svg>
  ),
  Text: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  RichText: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Button: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="6" width="16" height="12" rx="3" />
      <path d="m10 12 4-2v4l-4-2Z" />
    </svg>
  ),
  Card: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Hero: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  ),
};

export function Palette() {
  // Group components by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof playgroundComponentsList>();
    for (const comp of playgroundComponentsList) {
      const cat = comp.category || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(comp);
    }
    return map;
  }, []);

  return (
    <aside className="irich-sidebar irich-palette-sidebar">
      <div className="irich-sidebar-header">
        <h2 className="irich-sidebar-title">Components</h2>
        <span className="irich-sidebar-subtitle">Drag or click to add</span>
      </div>

      <div className="irich-palette-scroll">
        {categoryOrder.map((category) => {
          const components = categories.get(category);
          if (!components || components.length === 0) return null;

          return (
            <div key={category} className="irich-palette-category">
              <div className="irich-category-header">
                <span className="irich-category-name">{category}</span>
                <span className="irich-category-count">{components.length}</span>
              </div>

              <div className="irich-palette-list">
                {components.map((comp) => {
                  const icon = iconMap[comp.type] || iconMap.Card;
                  return (
                    <IRichPaletteItem
                      key={comp.type}
                      componentType={comp.type}
                      label={comp.label}
                      description={comp.description}
                    >
                      <div className="irich-palette-item-icon">{icon}</div>
                      <div className="irich-palette-item-info">
                        <div className="irich-palette-item-title">{comp.label}</div>
                        <div className="irich-palette-item-desc">{comp.description}</div>
                      </div>
                      <button
                        type="button"
                        className="irich-palette-add-btn"
                        title={`Insert ${comp.label}`}
                        aria-label={`Insert ${comp.label}`}
                      >
                        +
                      </button>
                    </IRichPaletteItem>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}


