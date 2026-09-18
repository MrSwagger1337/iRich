export type BadgeType = 'Stable' | 'Core' | 'React' | 'SSR' | 'Experimental';

export interface DocSection {
  id: string;
  title: string;
}

export interface DocPage {
  slug: string;
  category: string;
  categoryTitle: string;
  title: string;
  description: string;
  badge?: BadgeType;
  sections: DocSection[];
  content: string; // Markdown or formatted text content with code blocks and callouts
}

export interface NavItem {
  slug: string;
  title: string;
  badge?: BadgeType;
  category: string;
}

export interface NavCategory {
  id: string;
  title: string;
  items: NavItem[];
}
