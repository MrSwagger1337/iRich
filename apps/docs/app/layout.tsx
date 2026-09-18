import type { ReactNode } from 'react';
import './globals.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const metadata = {
  title: 'iRich Documentation - Extensible Visual Content Editor for React',
  description: 'Framework-independent core, React visual studio, SSR production renderer, and extensible plugin SDK.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
