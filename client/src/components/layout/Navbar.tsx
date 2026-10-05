import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Bell, Menu, X, Plus, User, LogOut, LayoutDashboard,
  MessageSquare, Heart, Settings, Shield, ChevronDown, Leaf
} from 'lucide-react';
import api from '../../api/axios';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications?limit=1').then(({ data }) => {
        setUnreadCount(data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/marketplace?listingType=Donate', label: 'Donations' },
    { to: '/marketplace?listingType=Exchange', label: 'Exchanges' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text hidden sm:block">ReLoop</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search items, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800/80 border border-dark-600/50 rounded-xl text-sm text-dark-100 placeholder:text-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </form>

          {/* Nav links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname + location.search === link.to
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/create"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-md hover:shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </Link>

                <Link to="/notifications" className="relative p-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link to="/messages" className="p-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 rounded-lg transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-dark-700/50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.firstName?.[0]
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass rounded-xl border border-dark-700/50 shadow-xl py-2 animate-slide-down">
                      <div className="px-4 py-3 border-b border-dark-700/50">
                        <p className="font-semibold text-dark-100">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-dark-400">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={`/profile/${user?._id}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link to="/impact" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 transition-colors">
                          <Leaf className="w-4 h-4" /> Impact
                        </Link>
                        <Link to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 transition-colors">
                          <Heart className="w-4 h-4" /> Favorites
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-400 hover:bg-dark-700/50 transition-colors">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-dark-700/50 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-dark-700/50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 rounded-lg"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden py-4 border-t border-dark-700/50 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text" placeholder="Search items..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800/80 border border-dark-600/50 rounded-xl text-sm"
                />
              </div>
            </form>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to} to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-dark-300 hover:text-dark-100 hover:bg-dark-700/50 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/listings/create" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-primary-400 hover:bg-dark-700/50 rounded-lg sm:hidden"
                >
                  + List an Item
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
