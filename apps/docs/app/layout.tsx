import type { ReactNode } from 'react';

export const metadata = {
  title: 'iRich Documentation',
  description: 'Extensible visual content editor and page builder for React',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
