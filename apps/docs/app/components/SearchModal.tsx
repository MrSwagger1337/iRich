'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { allDocPages } from '../docs/registry';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allDocPages.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryTitle.toLowerCase().includes(query.toLowerCase()),
      )
    : allDocPages.slice(0, 8);

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-box" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          type="text"
          placeholder="Search iRich documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <div className="search-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((page) => (
              <Link
                key={page.slug}
                href={`/docs/${page.category}/${page.slug}`}
                onClick={onClose}
                className="search-result-item"
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{page.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{page.categoryTitle}</div>
                </div>
                {page.badge && <span className={`badge-tag badge-${page.badge}`}>{page.badge}</span>}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
