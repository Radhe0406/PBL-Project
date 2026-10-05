import { Link } from 'react-router-dom';
import { Leaf, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700/50 bg-dark-900/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display gradient-text">ReLoop</span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              A community-driven marketplace for selling, donating, and exchanging pre-owned items. Reduce waste, save money, make an impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2.5">
              <li><Link to="/marketplace" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Browse All</Link></li>
              <li><Link to="/marketplace?listingType=Sell" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Buy Items</Link></li>
              <li><Link to="/marketplace?listingType=Donate" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Free Donations</Link></li>
              <li><Link to="/marketplace?listingType=Exchange" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Swap & Exchange</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Community</h4>
            <ul className="space-y-2.5">
              <li><Link to="/impact" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Impact Dashboard</Link></li>
              <li><Link to="/register" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Join ReLoop</Link></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Trust & Safety</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-dark-400 hover:text-primary-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-dark-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for the planet. © {new Date().getFullYear()} ReLoop
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-dark-500 hover:text-dark-300 transition-colors"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
