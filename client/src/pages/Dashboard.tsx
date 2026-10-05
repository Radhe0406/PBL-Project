import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Listing, DonationRequest, ExchangeProposal } from '../types';
import ListingCard from '../components/listing/ListingCard';
import { Package, Gift, ArrowRightLeft, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Pause, Play } from 'lucide-react';

type Tab = 'listings' | 'donations' | 'exchanges' | 'activity';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingTab, setListingTab] = useState<'Active' | 'Sold' | 'Donated' | 'Exchanged' | 'Paused'>('Active');

  useEffect(() => {
    if (!user) return;
    if (tab === 'listings') loadListings();
    if (tab === 'donations') loadDonations();
    if (tab === 'exchanges') loadExchanges();
  }, [tab, user, listingTab]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const status = listingTab;
      const { data } = await api.get(`/listings?sellerId=${user?._id}&status=${status}&limit=50`);
      setListings(data.listings);
    } catch {} finally { setLoading(false); }
  };

  const loadDonations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${user?._id}/donations`);
      setDonations(data.donations);
    } catch {} finally { setLoading(false); }
  };

  const loadExchanges = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${user?._id}/exchanges`);
      setExchanges(data.proposals);
    } catch {} finally { setLoading(false); }
  };

  const updateListingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/listings/${id}`, { status });
      loadListings();
    } catch {}
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      loadListings();
    } catch {}
  };

  const updateDonation = async (id: string, status: string) => {
    try {
      await api.put(`/donations/${id}`, { status });
      loadDonations();
    } catch {}
  };

  const updateExchange = async (id: string, status: string) => {
    try {
      await api.put(`/exchanges/${id}`, { status });
      loadExchanges();
    } catch {}
  };

  const tabs = [
    { key: 'listings' as Tab, label: 'My Listings', icon: Package },
    { key: 'donations' as Tab, label: 'Donations', icon: Gift },
    { key: 'exchanges' as Tab, label: 'Exchanges', icon: ArrowRightLeft },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title text-dark-100 mb-1">Dashboard</h1>
          <p className="text-dark-400">Manage your listings and transactions</p>
        </div>
        <Link to="/listings/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl mb-6 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-dark-200'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Listings Tab */}
      {tab === 'listings' && (
        <>
          <div className="flex gap-2 mb-6">
            {(['Active', 'Sold', 'Donated', 'Exchanged', 'Paused'] as const).map(s => (
              <button key={s} onClick={() => setListingTab(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${listingTab === s ? 'bg-dark-700 text-dark-100' : 'text-dark-400 hover:text-dark-200'}`}>
                {s}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
          ) : listings.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Package className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-300 mb-2">No {listingTab.toLowerCase()} listings</h3>
              <p className="text-dark-500 mb-4">Start by creating your first listing</p>
              <Link to="/listings/create" className="btn-primary">Create Listing</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(listing => (
                <div key={listing._id} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                    <img src={listing.primaryImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listings/${listing._id}`} className="font-semibold text-dark-100 hover:text-primary-400 transition-colors truncate block">{listing.title}</Link>
                    <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                      <span>{listing.category}</span>
                      <span>•</span>
                      <span>{listing.listingType}</span>
                      {listing.price && <><span>•</span><span>₹{listing.price.toLocaleString()}</span></>}
                      <span>•</span>
                      <span>{listing.viewCount} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {listingTab === 'Active' && (
                      <>
                        <Link to={`/listings/${listing._id}`} className="btn-ghost !p-2" title="View"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => updateListingStatus(listing._id, 'Paused')} className="btn-ghost !p-2 text-yellow-400" title="Pause"><Pause className="w-4 h-4" /></button>
                        <button onClick={() => deleteListing(listing._id)} className="btn-ghost !p-2 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                    {listingTab === 'Paused' && (
                      <button onClick={() => updateListingStatus(listing._id, 'Active')} className="btn-ghost !p-2 text-primary-400" title="Activate"><Play className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Donations Tab */}
      {tab === 'donations' && (
        <div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div> :
          donations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Gift className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-300">No donation activity yet</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.map((d: any) => (
                <div key={d._id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === 'Approved' ? 'bg-green-500/20' : d.status === 'Rejected' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                        {d.status === 'Approved' ? <CheckCircle className="w-5 h-5 text-green-400" /> : d.status === 'Rejected' ? <XCircle className="w-5 h-5 text-red-400" /> : <Clock className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-dark-200">{d.listingId?.title || 'Deleted listing'}</p>
                        <p className="text-xs text-dark-400">
                          {d.donorId?._id === user?._id ? `Requested by ${d.requesterId?.firstName}` : `Donated by ${d.donorId?.firstName}`}
                          <span className="ml-2">{new Date(d.createdAt).toLocaleDateString()}</span>
                        </p>
                        {d.message && <p className="text-xs text-dark-500 mt-1 italic">"{d.message}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${d.status === 'Approved' ? 'bg-green-500/20 text-green-300' : d.status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {d.status}
                      </span>
                      {d.status === 'Pending' && d.donorId?._id === user?._id && (
                        <div className="flex gap-1">
                          <button onClick={() => updateDonation(d._id, 'Approved')} className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30">Approve</button>
                          <button onClick={() => updateDonation(d._id, 'Rejected')} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30">Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exchanges Tab */}
      {tab === 'exchanges' && (
        <div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div> :
          exchanges.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ArrowRightLeft className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-300">No exchange proposals yet</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {exchanges.map((e: any) => (
                <div key={e._id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-700">
                          <img src={e.initiatorListingId?.primaryImage || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <ArrowRightLeft className="w-4 h-4 text-dark-500" />
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-700">
                          <img src={e.responderListingId?.primaryImage || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-dark-200 text-sm">
                          {e.initiatorListingId?.title || 'Item'} ↔ {e.responderListingId?.title || 'Item'}
                        </p>
                        <p className="text-xs text-dark-400">
                          {e.initiatorId?._id === user?._id ? 'You proposed' : `${e.initiatorId?.firstName} proposed`}
                          <span className="ml-2">{new Date(e.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${e.status === 'Accepted' || e.status === 'Completed' ? 'bg-green-500/20 text-green-300' : e.status === 'Rejected' || e.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {e.status}
                      </span>
                      {e.status === 'Pending' && e.responderId?._id === user?._id && (
                        <div className="flex gap-1">
                          <button onClick={() => updateExchange(e._id, 'Accepted')} className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30">Accept</button>
                          <button onClick={() => updateExchange(e._id, 'Rejected')} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30">Reject</button>
                        </div>
                      )}
                      {e.status === 'Pending' && e.initiatorId?._id === user?._id && (
                        <button onClick={() => updateExchange(e._id, 'Cancelled')} className="px-3 py-1 bg-dark-700 text-dark-300 text-xs rounded-lg hover:bg-dark-600">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
