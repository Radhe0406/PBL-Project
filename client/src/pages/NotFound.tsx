import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold font-display gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-dark-200 mb-3">Page Not Found</h2>
        <p className="text-dark-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
