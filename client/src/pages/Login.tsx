import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Leaf, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-display gradient-text">ReLoop</span>
            </Link>
            <h1 className="text-3xl font-bold font-display text-dark-50">Welcome back</h1>
            <p className="text-dark-400 mt-2">Sign in to continue your sustainable journey</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-dark-400">
                <input type="checkbox" className="rounded border-dark-600" />
                Remember me
              </label>
              <a href="#" className="text-sm text-primary-400 hover:text-primary-300">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center justify-center">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 glass-sm rounded-xl">
            <p className="text-xs text-dark-400 mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-dark-500">
              <p>Admin: arjun@example.com / Password123!</p>
              <p>User: priya@example.com / Password123!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center hero-gradient relative overflow-hidden">
        <div className="text-center p-12 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-8 shadow-glow">
            <Leaf className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display text-dark-100 mb-4">
            Every Item Reused is a Win for the Planet
          </h2>
          <p className="text-dark-400 max-w-md mx-auto">
            Join 8,200+ community members who are choosing reuse over waste. Together, we've diverted 35 tons of CO₂.
          </p>
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
