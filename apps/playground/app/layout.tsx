import type { ReactNode } from 'react';

export const metadata = {
  title: 'iRich Playground',
  description: 'Interactive editor & visual canvas playground for iRich',
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
