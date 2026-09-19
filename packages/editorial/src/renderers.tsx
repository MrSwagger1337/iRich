/**
 * @irich/editorial
 * Semantic production React renderers for canonical editorial components.
 * Strictly decoupled from the visual editor, canvas controllers, and drag-and-drop state.
 * 100% SSR / RSC compatible.
 */

import type { FC, ReactNode } from 'react';
import type { IRichNode } from '@irich/core';
import { sanitizeHref, sanitizeImageSrc } from './security';
import type {
  ButtonProps,
  CalloutProps,
  CardGridProps,
  CardProps,
  ColumnsProps,
  ContainerProps,
  CTAProps,
  HeadingProps,
  ImageProps,
  KeyTakeawayProps,
  QuoteProps,
  RichTextProps,
  SectionProps,
} from './types';

export interface EditorialRendererProps {
  node: IRichNode;
  id?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  children?: ReactNode;
  slots?: Record<string, ReactNode>;
}

/**
 * 1. Section Renderer
 */
export const SectionRenderer: FC<SectionProps & EditorialRendererProps> = ({
  variant = 'default',
  spacing = 'normal',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <section
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-section irich-editorial-section-${variant} irich-editorial-spacing-${spacing}`}
      data-irich-editorial="section"
    >
      {children}
    </section>
  );
};

/**
 * 2. Columns Renderer (2-Column Grid)
 */
export const ColumnsRenderer: FC<ColumnsProps & EditorialRendererProps> = ({
  layout = 'equal',
  gap = 'normal',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-columns irich-editorial-columns-${layout} irich-editorial-gap-${gap}`}
      data-irich-editorial="columns"
    >
      {children}
    </div>
  );
};

/**
 * 3. Column Renderer (Internal Column Node)
 */
export const ColumnRenderer: FC<EditorialRendererProps> = ({ id, dir, lang, children }) => {
  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className="irich-editorial-column"
      data-irich-editorial="column"
    >
      {children}
    </div>
  );
};

/**
 * 4. Image Renderer (Figure with Caption & Photo Credit)
 */
export const ImageRenderer: FC<ImageProps & EditorialRendererProps> = ({
  src,
  alt = '',
  caption,
  credit,
  aspect = 'auto',
  id,
  dir,
  lang,
}) => {
  const safeSrc = sanitizeImageSrc(src);

  if (!safeSrc) {
    return (
      <figure
        id={id}
        dir={dir}
        lang={lang}
        className={`irich-editorial-figure irich-editorial-aspect-${aspect} irich-editorial-figure-empty`}
        data-irich-editorial="image"
      >
        <div className="irich-editorial-image-placeholder">
          <span className="irich-editorial-image-placeholder-icon">🖼️</span>
          <span className="irich-editorial-image-placeholder-text">No image source specified</span>
        </div>
        {caption && (
          <figcaption className="irich-editorial-figcaption">
            <span className="irich-editorial-caption-text">{caption}</span>
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-figure irich-editorial-aspect-${aspect}`}
      data-irich-editorial="image"
    >
      <img
        src={safeSrc}
        alt={alt}
        className="irich-editorial-img"
        loading="lazy"
      />
      {(caption || credit) && (
        <figcaption className="irich-editorial-figcaption">
          {caption && <span className="irich-editorial-caption-text">{caption}</span>}
          {credit && <span className="irich-editorial-credit-text">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * 5. Callout Renderer (Contextual Aside)
 */
export const CalloutRenderer: FC<CalloutProps & EditorialRendererProps> = ({
  variant = 'info',
  id,
  dir,
  lang,
  children,
}) => {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    insight: '💡',
    warning: '⚠️',
    success: '✅',
  };

  return (
    <aside
      id={id}
      dir={dir}
      lang={lang}
      role="note"
      className={`irich-editorial-callout irich-editorial-callout-${variant}`}
      data-irich-editorial="callout"
    >
      <div className="irich-editorial-callout-icon" aria-hidden="true">
        {icons[variant] || 'ℹ️'}
      </div>
      <div className="irich-editorial-callout-body">{children}</div>
    </aside>
  );
};

/**
 * 6. Quote Renderer (Pull Quote with Attribution)
 */
export const QuoteRenderer: FC<QuoteProps & EditorialRendererProps> = ({
  attribution,
  source,
  variant = 'default',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <blockquote
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-quote irich-editorial-quote-${variant}`}
      data-irich-editorial="quote"
    >
      <div className="irich-editorial-quote-content">{children}</div>
      {(attribution || source) && (
        <footer className="irich-editorial-quote-footer">
          {attribution && (
            <cite className="irich-editorial-quote-attribution">{attribution}</cite>
          )}
          {source && (
            <span className="irich-editorial-quote-source">{source}</span>
          )}
        </footer>
      )}
    </blockquote>
  );
};

/**
 * 7. KeyTakeaway Renderer (Central Finding Summary)
 */
export const KeyTakeawayRenderer: FC<KeyTakeawayProps & EditorialRendererProps> = ({
  variant = 'default',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <aside
      id={id}
      dir={dir}
      lang={lang}
      role="complementary"
      className={`irich-editorial-takeaway irich-editorial-takeaway-${variant}`}
      data-irich-editorial="takeaway"
    >
      <div className="irich-editorial-takeaway-header">
        <span className="irich-editorial-takeaway-badge">KEY TAKEAWAY</span>
      </div>
      <div className="irich-editorial-takeaway-body">{children}</div>
    </aside>
  );
};

/**
 * 8. Card Renderer
 */
export const CardRenderer: FC<CardProps & EditorialRendererProps> = ({
  variant = 'default',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-card irich-editorial-card-${variant}`}
      data-irich-editorial="card"
    >
      {children}
    </div>
  );
};

/**
 * 9. CardGrid Renderer
 */
export const CardGridRenderer: FC<CardGridProps & EditorialRendererProps> = ({
  columns = '3',
  gap = 'normal',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-card-grid irich-editorial-grid-${columns} irich-editorial-gap-${gap}`}
      data-irich-editorial="card-grid"
    >
      {children}
    </div>
  );
};

/**
 * 10. Button Renderer (Styled Navigation Link)
 */
export const ButtonRenderer: FC<ButtonProps & EditorialRendererProps> = ({
  label = 'Learn More',
  href = '#',
  variant = 'primary',
  size = 'md',
  id,
  dir,
  lang,
}) => {
  const safeHref = sanitizeHref(href, '#');

  return (
    <a
      id={id}
      dir={dir}
      lang={lang}
      href={safeHref}
      role="button"
      className={`irich-editorial-btn irich-editorial-btn-${variant} irich-editorial-btn-${size}`}
      data-irich-editorial="button"
    >
      {label}
    </a>
  );
};

/**
 * 11. CTA Renderer (Call-to-Action Region)
 */
export const CTARenderer: FC<CTAProps & EditorialRendererProps> = ({
  variant = 'default',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <section
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-cta irich-editorial-cta-${variant}`}
      data-irich-editorial="cta"
    >
      {children}
    </section>
  );
};

/**
 * 12. Heading Renderer
 */
export const HeadingRenderer: FC<HeadingProps & EditorialRendererProps> = ({
  text = '',
  level = 'h2',
  align = 'left',
  color = 'default',
  id,
  dir,
  lang,
}) => {
  const HeadingTag = level as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <HeadingTag
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-heading irich-editorial-heading-${level} irich-editorial-align-${align} irich-editorial-heading-color-${color}`}
      data-irich-editorial="heading"
    >
      {text}
    </HeadingTag>
  );
};

/**
 * 13. RichText Renderer (Published HTML Prose)
 */
export const RichTextRenderer: FC<RichTextProps & EditorialRendererProps> = ({
  node,
  placeholder = 'Type formatted text here...',
  id,
  dir,
  lang,
}) => {
  const htmlContent = (node.props.content as string) || (node.props.html as string);

  if (htmlContent) {
    return (
      <div
        id={id}
        dir={dir}
        lang={lang}
        className="irich-editorial-richtext irich-editorial-prose"
        data-irich-editorial="richtext"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className="irich-editorial-richtext irich-editorial-prose irich-editorial-empty"
      data-irich-editorial="richtext"
    >
      <p className="irich-editorial-placeholder">{placeholder}</p>
    </div>
  );
};

/**
 * 14. Container Renderer
 */
export const ContainerRenderer: FC<ContainerProps & EditorialRendererProps> = ({
  maxWidth = 'wide',
  padding = 'medium',
  background = 'transparent',
  id,
  dir,
  lang,
  children,
}) => {
  return (
    <div
      id={id}
      dir={dir}
      lang={lang}
      className={`irich-editorial-container irich-editorial-max-${maxWidth} irich-editorial-pad-${padding} irich-editorial-bg-${background}`}
      data-irich-editorial="container"
    >
      {children}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorialComponentRenderer = React.ComponentType<any>;

/**
 * Complete component mapping of all canonical editorial components for use with @irich/renderer.
 */
export const editorialComponentMap: Record<string, EditorialComponentRenderer> = {
  Section: SectionRenderer,
  Columns: ColumnsRenderer,
  Column: ColumnRenderer,
  Image: ImageRenderer,
  Callout: CalloutRenderer,
  Quote: QuoteRenderer,
  KeyTakeaway: KeyTakeawayRenderer,
  Card: CardRenderer,
  CardGrid: CardGridRenderer,
  Button: ButtonRenderer,
  CTA: CTARenderer,
  Heading: HeadingRenderer,
  RichText: RichTextRenderer,
  Container: ContainerRenderer,
};

/**
 * Creates a fresh editorial component mapping, with optional custom overrides or extensions.
 */
export function createEditorialComponentMap(
  overrides?: Record<string, EditorialComponentRenderer>,
): Record<string, EditorialComponentRenderer> {
  return {
    ...editorialComponentMap,
    ...overrides,
  };
}
