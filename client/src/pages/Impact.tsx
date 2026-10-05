import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Badge, SustainabilityMetrics } from '../types';
import { Leaf, Droplets, Wind, Recycle, Trophy, TrendingUp } from 'lucide-react';

export default function Impact() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [percentile, setPercentile] = useState('');
  const [communityStats, setCommunityStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/users/${user._id}/impact`).then(({ data }) => {
        setMetrics(data.metrics);
        setBadges(data.badges || []);
        setPercentile(data.rank || '');
      }).catch(() => {}).finally(() => setLoading(false));

      // Community stats from admin dashboard (public portion)
      api.get('/admin/dashboard').then(({ data }) => {
        setCommunityStats(data.sustainability);
      }).catch(() => {});
    } else {
      setLoading(false);
    }
  }, [user]);

  const metricCards = metrics ? [
    { icon: Recycle, label: 'Items Reused', value: metrics.itemsReused, unit: 'items', color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-500/10' },
    { icon: Leaf, label: 'Waste Diverted', value: metrics.wasteDiverted.toFixed(1), unit: 'kg', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10' },
    { icon: Wind, label: 'CO₂ Avoided', value: metrics.co2Avoided.toFixed(1), unit: 'kg', color: 'from-accent-500 to-accent-600', bgColor: 'bg-accent-500/10' },
    { icon: Droplets, label: 'Water Saved', value: (metrics.waterSaved / 1000).toFixed(1), unit: 'kL', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
  ] : [];

  if (loading) {
    return (
      <div className="page-container">
        <div className="space-y-6">
          <div className="h-8 skeleton w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="text-center mb-12">
        <h1 className="section-title text-dark-100 mb-3">🌍 Your Environmental Impact</h1>
        <p className="text-dark-400 max-w-2xl mx-auto">
          Every item you reuse, donate, or exchange makes a real difference. Here's how you're contributing to a sustainable future.
        </p>
        {percentile && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium">
            <Trophy className="w-4 h-4" /> {percentile} of sustainable users
          </motion.div>
        )}
      </div>

      {/* Personal Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-bold font-display text-dark-100">{card.value}</p>
                <p className="text-sm text-dark-400">{card.unit} {card.label.toLowerCase()}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achievement Badges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-display text-dark-100 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-accent-400" /> Achievement Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge, i) => (
            <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 text-center transition-all ${badge.earned ? '' : 'opacity-40 grayscale'}`}>
              <span className="text-4xl block mb-3">{badge.icon}</span>
              <p className="font-semibold text-dark-200 text-sm mb-1">{badge.name}</p>
              <p className="text-xs text-dark-400">{badge.description}</p>
              {badge.earned && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] rounded-full font-medium">Earned ✓</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Community Impact */}
      {communityStats && (
        <div>
          <h2 className="text-2xl font-bold font-display text-dark-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-400" /> Community Impact
          </h2>
          <div className="glass-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold gradient-text">{communityStats.totalItemsReused?.toLocaleString() || 0}</p>
                <p className="text-sm text-dark-400 mt-1">Total Items Reused</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{(communityStats.totalWasteDiverted || 0).toFixed(0)} kg</p>
                <p className="text-sm text-dark-400 mt-1">Waste Diverted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-400">{(communityStats.totalCo2Avoided || 0).toFixed(0)} kg</p>
                <p className="text-sm text-dark-400 mt-1">CO₂ Avoided</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{((communityStats.totalWaterSaved || 0) / 1000).toFixed(0)} kL</p>
                <p className="text-sm text-dark-400 mt-1">Water Saved</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
