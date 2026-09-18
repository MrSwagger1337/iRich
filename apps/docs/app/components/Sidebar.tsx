'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNavigation } from '../docs/registry';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      {docsNavigation.map((category) => (
        <div key={category.id} className="docs-category">
          <div className="docs-category-title">{category.title}</div>
          <div>
            {category.items.map((item) => {
              const href = `/docs/${item.category}/${item.slug}`;
              const isActive = pathname === href;

              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={`docs-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{item.title}</span>
                  {item.badge && <span className={`badge-tag badge-${item.badge}`}>{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
