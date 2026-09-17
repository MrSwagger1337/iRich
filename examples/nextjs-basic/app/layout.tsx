import type { ReactNode } from 'react';

export const metadata = {
  title: 'iRich Next.js Basic Example',
  description: 'Basic integration of iRich in a Next.js application',
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
