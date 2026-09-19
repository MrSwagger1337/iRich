/**
 * @irich/editorial
 * Component prop interfaces and type definitions for canonical editorial vocabulary.
 */

import type { RichTextDocument } from '@irich/rich-text';

export interface SectionProps {
  variant?: 'default' | 'muted' | 'accent';
  spacing?: 'normal' | 'compact' | 'spacious';
}

export interface ColumnsProps {
  layout?: 'equal' | 'start-narrow' | 'end-narrow';
  gap?: 'normal' | 'compact' | 'spacious';
}

export type ColumnProps = Record<string, never>;

export interface ImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  aspect?: 'auto' | '16-9' | '4-3' | '1-1' | 'wide';
}

export interface CalloutProps {
  variant?: 'info' | 'insight' | 'warning' | 'success';
}

export interface QuoteProps {
  attribution?: string;
  source?: string;
  variant?: 'default' | 'featured';
}

export interface KeyTakeawayProps {
  variant?: 'default' | 'emphasized';
}

export interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
}

export interface CardGridProps {
  columns?: '2' | '3' | '4';
  gap?: 'normal' | 'compact' | 'spacious';
}

export interface ButtonProps {
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export interface CTAProps {
  variant?: 'default' | 'emphasized';
}

export interface HeadingProps {
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  align?: 'left' | 'center' | 'right';
  color?: 'default' | 'muted' | 'gradient';
}

export interface RichTextProps {
  content?: RichTextDocument;
  placeholder?: string;
}

export interface ContainerProps {
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  padding?: 'none' | 'small' | 'medium' | 'large';
  background?: 'transparent' | 'subtle' | 'card';
}
