import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Share2, Flag, MessageSquare, Gift, ArrowRightLeft, Tag, Calendar, Eye, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Listing, User as UserType, Review } from '../types';

const placeholderImages: Record<string, string> = {
  'Electronics & Gadgets': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
  'Books & Stationery': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
  'Furniture & Home Decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
  'Clothing & Accessories': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
  'Sports & Outdoor': 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcfa8?w=800&h=600&fit=crop',
  'Bicycles & Vehicles': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop',
  'Household Appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'Toys & Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
  'Musical Instruments': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop',
  'Other': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
};

export default function ListingDetail() {
  const { listingId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<UserType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (listingId) {
      api.get(`/listings/${listingId}`)
        .then(({ data }) => {
          setListing(data.listing);
          const s = data.listing.sellerId as UserType;
          setSeller(s);
          if (s?._id) {
            api.get(`/reviews/user/${s._id}?limit=5`).then(({ data: rData }) => {
              setReviews(rData.reviews || []);
            }).catch(() => {});
          }
        })
        .catch(() => navigate('/marketplace'))
        .finally(() => setLoading(false));
    }
  }, [listingId]);

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { recipientId: seller?._id, content: message, listingId });
      setShowContact(false);
      setMessage('');
      alert('Message sent successfully!');
    } catch { alert('Failed to send message'); }
    finally { setSending(false); }
  };

  const handleDonationRequest = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await api.post('/donations', { listingId: listing?._id, message: message || 'I would like to request this donation.' });
      alert('Donation request sent!');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to send request'); }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/listings/${listing?._id}/favorite`);
      setLiked(data.favorited);
    } catch {}
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton w-3/4" />
            <div className="h-4 skeleton w-1/4" />
            <div className="h-32 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images?.length > 0 ? listing.images : [placeholderImages[listing.category] || placeholderImages['Other']];
  const isOwner = user?._id === (seller?._id || listing.sellerId);

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 flex items-center gap-1 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-card">
            <img src={images[currentImage]} alt={listing.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImage(i => i > 0 ? i - 1 : images.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-dark-900/80">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentImage(i => i < images.length - 1 ? i + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-dark-900/80">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-dark-900/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentImage ? 'border-primary-500' : 'border-transparent opacity-60'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {listing.listingType === 'Sell' && <span className="badge badge-sell flex items-center gap-1"><Tag className="w-3 h-3" /> For Sale</span>}
                {listing.listingType === 'Donate' && <span className="badge badge-donate flex items-center gap-1"><Gift className="w-3 h-3" /> Donation</span>}
                {listing.listingType === 'Exchange' && <span className="badge badge-exchange flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /> Exchange</span>}
                <span className={`badge ${listing.condition === 'New' ? 'badge-condition-new' : listing.condition === 'Like New' ? 'badge-condition-like-new' : listing.condition === 'Good' ? 'badge-condition-good' : 'badge-condition-fair'}`}>
                  {listing.condition}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-dark-50">{listing.title}</h1>
            </div>
          </div>

          {listing.listingType === 'Sell' && listing.price && (
            <p className="text-3xl font-bold gradient-text mb-2">₹{listing.price.toLocaleString('en-IN')}</p>
          )}
          {listing.listingType === 'Donate' && <p className="text-2xl font-bold text-accent-400 mb-2">FREE</p>}
          {listing.listingType === 'Exchange' && listing.exchangePreferences && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300"><strong>Looking for:</strong> {listing.exchangePreferences}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-dark-400 mb-6">
            {listing.location?.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location.area ? `${listing.location.area}, ` : ''}{listing.location.city}</span>}
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {listing.viewCount} views</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="glass-card p-5 mb-6">
            <h3 className="font-semibold text-dark-200 mb-3">Description</h3>
            <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            {(listing.brand || listing.yearOfPurchase || listing.originalPrice) && (
              <div className="mt-4 pt-4 border-t border-dark-700/50 grid grid-cols-3 gap-4 text-sm">
                {listing.brand && <div><span className="text-dark-500">Brand</span><p className="text-dark-200 font-medium">{listing.brand}</p></div>}
                {listing.yearOfPurchase && <div><span className="text-dark-500">Purchased</span><p className="text-dark-200 font-medium">{listing.yearOfPurchase}</p></div>}
                {listing.originalPrice && <div><span className="text-dark-500">Original Price</span><p className="text-dark-200 font-medium">₹{listing.originalPrice.toLocaleString()}</p></div>}
              </div>
            )}
          </div>

          {/* Sustainability */}
          <div className="glass-card p-5 mb-6">
            <h3 className="font-semibold text-dark-200 mb-3 flex items-center gap-2">🌱 Environmental Impact</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-primary-500/10 rounded-xl">
                <p className="text-lg font-bold text-primary-400">{listing.sustainabilityMetrics?.wasteDivertedKg || 0} kg</p>
                <p className="text-dark-400">Waste Diverted</p>
              </div>
              <div className="text-center p-3 bg-accent-500/10 rounded-xl">
                <p className="text-lg font-bold text-accent-400">{listing.sustainabilityMetrics?.co2AvoidedKg || 0} kg</p>
                <p className="text-dark-400">CO₂ Avoided</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isOwner && (
            <div className="flex gap-3 mb-6">
              {listing.listingType === 'Sell' && (
                <button onClick={() => setShowContact(true)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Contact Seller
                </button>
              )}
              {listing.listingType === 'Donate' && (
                <button onClick={handleDonationRequest} className="btn-accent flex-1 flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4" /> Request Item
                </button>
              )}
              {listing.listingType === 'Exchange' && (
                <button onClick={() => setShowContact(true)} className="btn-primary flex-1 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}>
                  <ArrowRightLeft className="w-4 h-4" /> Propose Exchange
                </button>
              )}
              <button onClick={handleFavorite} className={`btn-secondary !px-4 ${liked ? 'border-red-500/50' : ''}`}>
                <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-red-400' : ''}`} />
              </button>
              <button className="btn-secondary !px-4"><Share2 className="w-5 h-5" /></button>
            </div>
          )}

          {/* Seller info */}
          {seller && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-dark-200 mb-3">Seller</h3>
              <Link to={`/profile/${seller._id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {seller.avatar ? <img src={seller.avatar} alt="" className="w-full h-full object-cover" /> : seller.firstName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-dark-100 group-hover:text-primary-400 transition-colors flex items-center gap-1">
                    {seller.firstName} {seller.lastName}
                    {seller.verifications?.email && <ShieldCheck className="w-4 h-4 text-primary-400" />}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    {seller.rating?.averageRating > 0 && (
                      <span className="flex items-center gap-1 text-accent-400">
                        <Star className="w-3.5 h-3.5 fill-accent-400" /> {seller.rating.averageRating.toFixed(1)} ({seller.rating.totalReviews})
                      </span>
                    )}
                    <span>Member since {new Date(seller.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-dark-100 mb-6">Seller Reviews</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map(review => {
              const reviewer = review.reviewerId as UserType;
              return (
                <div key={review._id} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold">
                      {reviewer?.firstName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-200">{reviewer?.firstName} {reviewer?.lastName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent-400 fill-accent-400' : 'text-dark-600'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-dark-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-dark-300">{review.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-lg font-bold text-dark-100 mb-4">Send a Message</h3>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi, I'm interested in "${listing.title}". Is it still available?`}
              rows={4} className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowContact(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleContact} disabled={sending || !message.trim()} className="btn-primary flex-1">
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
