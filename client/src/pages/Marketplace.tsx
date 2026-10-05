import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { Listing, CATEGORIES, CONDITIONS, ListingType, ListingCategory, ListingCondition } from '../types';
import ListingCard from '../components/listing/ListingCard';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [listingType, setListingType] = useState<string>(searchParams.get('listingType') || '');
  const [condition, setCondition] = useState<string>(searchParams.get('condition') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    fetchListings();
  }, [category, listingType, condition, sort, minPrice, maxPrice, page]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      searchListings(q);
    }
  }, [searchParams.get('q')]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20', sort };
      if (category) params.category = category;
      if (listingType) params.listingType = listingType;
      if (condition) params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get('/listings', { params });
      if (page === 1) setListings(data.listings);
      else setListings(prev => [...prev, ...data.listings]);
      setTotal(data.pagination.total);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const searchListings = async (q: string) => {
    if (!q.trim()) { fetchListings(); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/listings/search', { params: { q, page: 1, limit: 20 } });
      setListings(data.listings);
      setTotal(data.pagination.total);
    } catch {
      fetchListings();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      searchListings(searchQuery);
    } else {
      setSearchParams({});
      setPage(1);
      fetchListings();
    }
  };

  const clearFilters = () => {
    setCategory(''); setListingType(''); setCondition('');
    setMinPrice(''); setMaxPrice(''); setSort('newest');
    setSearchQuery(''); setSearchParams({});
    setPage(1);
  };

  const activeFilters = [category, listingType, condition, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title text-dark-100 mb-2">Marketplace</h1>
        <p className="text-dark-400">Discover pre-owned items from your community</p>
      </div>

      {/* Search and controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for items, brands, categories..."
              className="input-field pl-12 pr-24"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-400 transition-colors">
              Search
            </button>
          </div>
        </form>
        <div className="flex gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 !py-3 ${activeFilters > 0 ? 'border-primary-500/50 text-primary-400' : ''}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters > 0 && <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{activeFilters}</span>}
          </button>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field !w-auto !py-3 text-sm cursor-pointer">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category && <span className="badge bg-primary-500/20 text-primary-300 flex items-center gap-1">{category} <button onClick={() => { setCategory(''); setPage(1); }}><X className="w-3 h-3" /></button></span>}
          {listingType && <span className="badge bg-blue-500/20 text-blue-300 flex items-center gap-1">{listingType} <button onClick={() => { setListingType(''); setPage(1); }}><X className="w-3 h-3" /></button></span>}
          {condition && <span className="badge bg-yellow-500/20 text-yellow-300 flex items-center gap-1">{condition} <button onClick={() => { setCondition(''); setPage(1); }}><X className="w-3 h-3" /></button></span>}
          <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-dark-200">Clear all</button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field text-sm">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Listing Type</label>
              <select value={listingType} onChange={(e) => { setListingType(e.target.value); setPage(1); }} className="input-field text-sm">
                <option value="">All Types</option>
                <option value="Sell">For Sale</option>
                <option value="Donate">Donations</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>
            <div>
              <label className="input-label">Condition</label>
              <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1); }} className="input-field text-sm">
                <option value="">Any Condition</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Min Price (₹)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="input-field text-sm" />
            </div>
            <div>
              <label className="input-label">Max Price (₹)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className="input-field text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-dark-400 mb-4">{total} items found</p>

      {/* Listing grid */}
      {loading && listings.length === 0 ? (
        <div className="card-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="aspect-[4/3] skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="text-xl font-semibold text-dark-200 mb-2">No items found</h3>
          <p className="text-dark-400 mb-4">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {listings.map(listing => <ListingCard key={listing._id} listing={listing} />)}
          </div>
          {listings.length < total && (
            <div className="text-center mt-8">
              <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-secondary">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
