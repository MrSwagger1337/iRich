import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iRich Next.js Basic Example',
  description:
    'Demonstration of embeddable visual content editing, component definitions, and SSR rendering in Next.js with iRich.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
