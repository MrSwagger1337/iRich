import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'iRich Visual Editor Playground',
  description: 'Interactive visual page builder and component canvas playground for iRich',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
