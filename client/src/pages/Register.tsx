import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '', city: '', area: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display gradient-text">ReLoop</span>
          </Link>
          <h1 className="text-3xl font-bold font-display text-dark-50">Create your account</h1>
          <p className="text-dark-400 mt-2">Start your circular economy journey today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required className="input-field pl-10 text-sm" />
              </div>
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="input-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="input-field pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="input-label">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="input-field pl-10 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className="input-field pl-10 text-sm" />
              </div>
            </div>
            <div>
              <label className="input-label">Area</label>
              <input name="area" value={form.area} onChange={handleChange} placeholder="Andheri West" className="input-field text-sm" />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 8 characters" required className="input-field pl-10 pr-10 text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required className="input-field pl-10 text-sm" />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-dark-400">
            <input type="checkbox" required className="mt-1 rounded border-dark-600" />
            I agree to the <a href="#" className="text-primary-400">Terms of Service</a> and <a href="#" className="text-primary-400">Privacy Policy</a>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full text-center justify-center">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
