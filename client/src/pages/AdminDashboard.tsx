import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Package, Flag, TrendingUp, Leaf, Shield, CheckCircle, XCircle, Eye, Ban, Trash2, UserCheck, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'listings' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'listings') loadListings();
    if (tab === 'reports') loadReports();
  }, [tab]);

  const loadDashboard = async () => {
    try { const { data } = await api.get('/admin/dashboard'); setStats(data); } catch {} finally { setLoading(false); }
  };
  const loadUsers = async () => {
    try { const { data } = await api.get('/admin/users?limit=50'); setUsers(data.users || []); } catch {}
  };
  const loadListings = async () => {
    try { const { data } = await api.get('/admin/listings?limit=50'); setListings(data.listings || []); } catch {}
  };
  const loadReports = async () => {
    try { const { data } = await api.get('/admin/reports?limit=50'); setReports(data.reports || []); } catch {}
  };

  const handleUserAction = async (userId: string, action: string) => {
    try { await api.put(`/admin/users/${userId}`, { action }); loadUsers(); loadDashboard(); } catch {}
  };
  const handleListingAction = async (listingId: string, action: string) => {
    try { await api.put(`/admin/listings/${listingId}`, { action }); loadListings(); loadDashboard(); } catch {}
  };
  const handleReportAction = async (reportId: string, action: string) => {
    try { await api.put(`/admin/reports/${reportId}`, { action }); loadReports(); loadDashboard(); } catch {}
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { key: 'users' as const, label: 'Users', icon: Users },
    { key: 'listings' as const, label: 'Listings', icon: Package },
    { key: 'reports' as const, label: 'Reports', icon: Flag },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-accent-400" />
        <div>
          <h1 className="section-title text-dark-100">Admin Dashboard</h1>
          <p className="text-dark-400">Manage users, listings, and platform health</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl mb-8 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-accent-500 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.stats?.totalUsers || 0, icon: Users, color: 'text-blue-400' },
              { label: 'Active Listings', value: stats.stats?.activeListings || 0, icon: Package, color: 'text-primary-400' },
              { label: 'Transactions', value: stats.stats?.completedTransactions || 0, icon: TrendingUp, color: 'text-accent-400' },
              { label: 'Pending Reports', value: stats.stats?.pendingReports || 0, icon: Flag, color: 'text-red-400' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card p-5">
                  <Icon className={`w-6 h-6 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-dark-100">{s.value}</p>
                  <p className="text-xs text-dark-400">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Sustainability stats */}
          {stats.sustainability && (
            <div className="glass-card p-6 mb-8">
              <h3 className="font-semibold text-dark-200 mb-4 flex items-center gap-2"><Leaf className="w-5 h-5 text-primary-400" /> Platform Sustainability</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-primary-500/10 rounded-xl"><p className="text-xl font-bold text-primary-400">{stats.sustainability.totalItemsReused}</p><p className="text-xs text-dark-400">Items Reused</p></div>
                <div className="p-3 bg-green-500/10 rounded-xl"><p className="text-xl font-bold text-green-400">{stats.sustainability.totalWasteDiverted?.toFixed(0)} kg</p><p className="text-xs text-dark-400">Waste Diverted</p></div>
                <div className="p-3 bg-accent-500/10 rounded-xl"><p className="text-xl font-bold text-accent-400">{stats.sustainability.totalCo2Avoided?.toFixed(0)} kg</p><p className="text-xs text-dark-400">CO₂ Avoided</p></div>
                <div className="p-3 bg-blue-500/10 rounded-xl"><p className="text-xl font-bold text-blue-400">{(stats.sustainability.totalWaterSaved / 1000)?.toFixed(0)} kL</p><p className="text-xs text-dark-400">Water Saved</p></div>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {stats.categoryStats?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-dark-200 mb-4">Categories</h3>
              <div className="space-y-2">
                {stats.categoryStats.map((cat: any) => (
                  <div key={cat._id} className="flex items-center gap-3">
                    <span className="text-sm text-dark-300 w-48 truncate">{cat._id}</span>
                    <div className="flex-1 bg-dark-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full" style={{ width: `${Math.min(100, (cat.count / (stats.stats?.activeListings || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm text-dark-400 w-8 text-right">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">{u.firstName?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-200">{u.firstName} {u.lastName} {u.role === 'admin' && <span className="badge bg-accent-500/20 text-accent-300 ml-1">Admin</span>}</p>
                <p className="text-xs text-dark-400">{u.email} • {u.location?.city || 'No location'} • Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`badge text-xs ${u.status === 'Active' ? 'bg-green-500/20 text-green-300' : u.status === 'Suspended' ? 'bg-red-500/20 text-red-300' : 'bg-dark-600 text-dark-300'}`}>{u.status}</span>
              <div className="flex gap-1">
                {u.status === 'Active' && <button onClick={() => handleUserAction(u._id, 'suspend')} className="p-1.5 text-yellow-400 hover:bg-dark-700/50 rounded-lg" title="Suspend"><Ban className="w-4 h-4" /></button>}
                {u.status === 'Suspended' && <button onClick={() => handleUserAction(u._id, 'activate')} className="p-1.5 text-green-400 hover:bg-dark-700/50 rounded-lg" title="Activate"><UserCheck className="w-4 h-4" /></button>}
                {!u.verifications?.email && <button onClick={() => handleUserAction(u._id, 'verify')} className="p-1.5 text-blue-400 hover:bg-dark-700/50 rounded-lg" title="Verify"><CheckCircle className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      {tab === 'listings' && (
        <div className="space-y-3">
          {listings.map(l => (
            <div key={l._id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                <img src={l.primaryImage || l.images?.[0] || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-200 truncate">{l.title}</p>
                <p className="text-xs text-dark-400">{l.category} • {l.listingType} • by {l.sellerId?.firstName} {l.sellerId?.lastName}</p>
              </div>
              <span className={`badge text-xs ${l.status === 'Active' ? 'bg-green-500/20 text-green-300' : l.status === 'Flagged' ? 'bg-red-500/20 text-red-300' : 'bg-dark-600 text-dark-300'}`}>{l.status}</span>
              <div className="flex gap-1">
                {l.status === 'Flagged' && <button onClick={() => handleListingAction(l._id, 'approve')} className="p-1.5 text-green-400 hover:bg-dark-700/50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>}
                <button onClick={() => handleListingAction(l._id, 'remove')} className="p-1.5 text-red-400 hover:bg-dark-700/50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        reports.length === 0 ? (
          <div className="glass-card p-12 text-center"><Flag className="w-12 h-12 text-dark-600 mx-auto mb-4" /><p className="text-dark-400">No reports</p></div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r._id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark-200">{r.reason}</p>
                    <p className="text-xs text-dark-400">Type: {r.reportType} • By {r.reporterId?.firstName} {r.reporterId?.lastName} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.details && <p className="text-xs text-dark-500 mt-1 italic">"{r.details}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${r.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' : r.status === 'Resolved' ? 'bg-green-500/20 text-green-300' : 'bg-dark-600 text-dark-300'}`}>{r.status}</span>
                    {r.status === 'Pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleReportAction(r._id, 'resolve')} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">Resolve</button>
                        <button onClick={() => handleReportAction(r._id, 'dismiss')} className="px-2 py-1 bg-dark-700 text-dark-400 text-xs rounded-lg">Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
