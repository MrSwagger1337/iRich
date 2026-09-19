/**
 * @irich/editorial
 * Standard editorial component library and renderers for iRich.
 */

// Prop types
export type {
  SectionProps,
  ColumnsProps,
  ColumnProps,
  ImageProps,
  CalloutProps,
  QuoteProps,
  KeyTakeawayProps,
  CardProps,
  CardGridProps,
  ButtonProps,
  CTAProps,
  HeadingProps,
  RichTextProps,
  ContainerProps,
} from './types';

// Security validation & sanitization
export {
  isSafeHref,
  isSafeImageSrc,
  sanitizeHref,
  sanitizeImageSrc,
} from './security';

// Component Definitions & Registry
export {
  SectionComponent,
  ColumnsComponent,
  ColumnComponent,
  ImageComponent,
  CalloutComponent,
  QuoteComponent,
  KeyTakeawayComponent,
  CardComponent,
  CardGridComponent,
  ButtonComponent,
  CTAComponent,
  HeadingComponent,
  RichTextComponent,
  ContainerComponent,
  editorialDefinitions,
  createEditorialRegistry,
} from './definitions';

// Production React Renderers & Component Map
export {
  SectionRenderer,
  ColumnsRenderer,
  ColumnRenderer,
  ImageRenderer,
  CalloutRenderer,
  QuoteRenderer,
  KeyTakeawayRenderer,
  CardRenderer,
  CardGridRenderer,
  ButtonRenderer,
  CTARenderer,
  HeadingRenderer,
  RichTextRenderer,
  ContainerRenderer,
  editorialComponentMap,
  createEditorialComponentMap,
  type EditorialRendererProps,
} from './renderers';

// Fixtures
export {
  flatArticleDocument,
  redesignedEditorialDocument,
  arabicEditorialDocument,
} from './fixtures/article-redesign';

