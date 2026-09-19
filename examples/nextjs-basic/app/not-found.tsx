import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2>Page Not Found</h2>
      <p style={{ margin: '1rem 0' }}>Could not find requested resource</p>
      <Link href="/" className="irich-btn irich-btn-primary">
        Return Home
      </Link>
    </div>
  );
}
