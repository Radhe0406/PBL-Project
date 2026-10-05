import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Listing } from '../types';
import ListingCard from '../components/listing/ListingCard';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get(`/users/${user._id}/favorites`)
        .then(({ data }) => setFavorites(data.favorites || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="page-container">
      <h1 className="section-title text-dark-100 mb-2">Saved Items</h1>
      <p className="text-dark-400 mb-8">Your favorited listings</p>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="aspect-[4/3] skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Heart className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No saved items yet</h3>
          <p className="text-dark-500">Items you favorite will appear here</p>
        </div>
      ) : (
        <div className="card-grid">
          {favorites.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
