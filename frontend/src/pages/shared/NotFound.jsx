import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <span className="text-6xl">🧵</span>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="theme-muted">This thread doesn't lead anywhere.</p>
      <Link to="/" className="mt-4 text-brand-pink hover:underline text-sm">
        Go back home →
      </Link>
    </div>
  );
}
