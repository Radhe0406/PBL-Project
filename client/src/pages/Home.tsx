import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Recycle, Heart, ArrowRightLeft, TrendingUp, ShieldCheck, Users } from 'lucide-react';
import api from '../api/axios';
import { Listing, CATEGORY_ICONS } from '../types';
import ListingCard from '../components/listing/ListingCard';

const stats = [
  { label: 'Items Reused', value: '12,450+', icon: Recycle },
  { label: 'CO₂ Avoided', value: '35 Tons', icon: Leaf },
  { label: 'Community Members', value: '8,200+', icon: Users },
  { label: 'Transactions', value: '9,800+', icon: TrendingUp },
];

const features = [
  {
    icon: Heart,
    title: 'Donate with Purpose',
    description: 'Give pre-loved items a second life. Every donation reduces waste and helps someone in need.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: ArrowRightLeft,
    title: 'Exchange & Swap',
    description: 'Trade items you no longer need for things you actually want. No money required.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: ShieldCheck,
    title: 'Verified & Trusted',
    description: 'Every seller is verified. Ratings, reviews, and Digilocker integration keep our community safe.',
    color: 'from-primary-500 to-primary-600',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?limit=8&sort=popular')
      .then(({ data }) => setFeatured(data.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-6">
                <Leaf className="w-4 h-4" />
                Join the Circular Economy
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-dark-50 leading-tight mb-6">
                Give Every Item a{' '}
                <span className="gradient-text">Second Life</span>
              </h1>
              <p className="text-lg md:text-xl text-dark-300 leading-relaxed mb-8 max-w-2xl">
                Buy, sell, donate, or exchange pre-owned items in your community.
                Track your environmental impact and earn badges as you contribute
                to a sustainable future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/marketplace" className="btn-primary text-base flex items-center gap-2">
                  Explore Marketplace <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="btn-secondary text-base">
                  Create Account
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 text-center"
                >
                  <Icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                  <p className="text-2xl md:text-3xl font-bold font-display text-dark-100">{stat.value}</p>
                  <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title text-dark-100 mb-4">Browse by Category</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">Find exactly what you're looking for across our curated categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(CATEGORY_ICONS).slice(0, 11).map(([cat, icon]) => (
              <Link
                key={cat}
                to={`/marketplace?category=${encodeURIComponent(cat)}`}
                className="glass-card p-4 text-center hover:border-primary-500/40 transition-all group"
              >
                <span className="text-3xl block mb-2">{icon}</span>
                <span className="text-xs text-dark-300 group-hover:text-primary-400 transition-colors">{cat.split(' & ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title text-dark-100 mb-4">Why ReLoop?</h2>
            <p className="text-dark-400 max-w-2xl mx-auto">Three powerful ways to participate in the circular economy</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="glass-card p-8"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-100 mb-3">{feature.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title text-dark-100 mb-2">Featured Items</h2>
              <p className="text-dark-400">Discover what your community is sharing</p>
            </div>
            <Link to="/marketplace" className="btn-ghost text-primary-400 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="card-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <div className="aspect-[4/3] skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-grid">
              {featured.slice(0, 8).map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 hero-gradient opacity-50" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-dark-50 mb-4">
                Ready to Make an Impact?
              </h2>
              <p className="text-dark-300 max-w-xl mx-auto mb-8">
                Join thousands of community members who are choosing reuse over waste. Every item counts.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-primary text-base">
                  Get Started for Free
                </Link>
                <Link to="/listings/create" className="btn-accent text-base">
                  List Your First Item
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
