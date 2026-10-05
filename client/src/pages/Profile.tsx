import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User as UserType, Listing, Review } from '../types';
import ListingCard from '../components/listing/ListingCard';
import { MapPin, Star, Calendar, ShieldCheck, Mail, Phone, Edit, Leaf } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'reviews'>('listings');
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      api.get(`/users/${userId}`).then(({ data }) => { setProfileUser(data.user); }),
      api.get(`/listings?sellerId=${userId}&status=Active&limit=20`).then(({ data }) => { setListings(data.listings || []); }),
      api.get(`/reviews/user/${userId}?limit=10`).then(({ data }) => { setReviews(data.reviews || []); }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <div className="page-container"><div className="h-48 skeleton rounded-2xl mb-6" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-52 skeleton rounded-2xl" />)}</div></div>;
  }

  if (!profileUser) return <div className="page-container text-center py-20"><p className="text-dark-400">User not found</p></div>;

  return (
    <div className="page-container">
      {/* Profile header */}
      <div className="glass-card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden flex-shrink-0">
            {profileUser.avatar ? <img src={profileUser.avatar} alt="" className="w-full h-full object-cover" /> : profileUser.firstName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
                  {profileUser.firstName} {profileUser.lastName}
                  {profileUser.verifications?.email && <ShieldCheck className="w-5 h-5 text-primary-400" />}
                  {profileUser.verifications?.digilocker && <ShieldCheck className="w-5 h-5 text-green-400" />}
                </h1>
                {profileUser.bio && <p className="text-dark-400 mt-1">{profileUser.bio}</p>}
              </div>
              {isOwnProfile && (
                <Link to="/dashboard" className="btn-secondary text-sm flex items-center gap-1"><Edit className="w-4 h-4" /> Edit</Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark-400">
              {profileUser.location?.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profileUser.location.area ? `${profileUser.location.area}, ` : ''}{profileUser.location.city}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              {profileUser.rating?.averageRating > 0 && (
                <span className="flex items-center gap-1 text-accent-400"><Star className="w-4 h-4 fill-accent-400" /> {profileUser.rating.averageRating.toFixed(1)} ({profileUser.rating.totalReviews} reviews)</span>
              )}
            </div>
            {/* Sustainability snippet */}
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 rounded-lg text-xs text-primary-400 font-medium">
                <Leaf className="w-3.5 h-3.5" /> {profileUser.sustainabilityMetrics?.itemsReused || 0} items reused
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-lg text-xs text-green-400 font-medium">
                🌱 {(profileUser.sustainabilityMetrics?.wasteDiverted || 0).toFixed(0)} kg waste diverted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button onClick={() => setTab('listings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'listings' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200 bg-dark-800/50'}`}>
          Listings ({listings.length})
        </button>
        <button onClick={() => setTab('reviews')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'reviews' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-200 bg-dark-800/50'}`}>
          Reviews ({reviews.length})
        </button>
      </div>

      {tab === 'listings' && (
        listings.length === 0 ? (
          <div className="glass-card p-12 text-center"><p className="text-dark-400">No active listings</p></div>
        ) : (
          <div className="card-grid">{listings.map(l => <ListingCard key={l._id} listing={l} />)}</div>
        )
      )}

      {tab === 'reviews' && (
        reviews.length === 0 ? (
          <div className="glass-card p-12 text-center"><p className="text-dark-400">No reviews yet</p></div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => {
              const reviewer = review.reviewerId as UserType;
              return (
                <div key={review._id} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold">{reviewer?.firstName?.[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-dark-200">{reviewer?.firstName} {reviewer?.lastName}</p>
                      <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent-400 fill-accent-400' : 'text-dark-600'}`} />)}</div>
                    </div>
                    <span className="ml-auto text-xs text-dark-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-dark-300">{review.comment}</p>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
