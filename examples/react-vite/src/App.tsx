import { IRichProvider, IRichEditor } from '@irich/react';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>iRich React + Vite Example</h1>
      <p>Demonstrating iRich in a standard Vite React application.</p>
      <div
        style={{
          marginTop: '1rem',
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: '4px',
        }}
      >
        <IRichProvider>
          <IRichEditor />
        </IRichProvider>
      </div>
    </div>
  );
}
