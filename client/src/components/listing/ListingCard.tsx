import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Tag, ArrowRightLeft, Gift } from 'lucide-react';
import { Listing, User as UserType } from '../../types';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface ListingCardProps {
  listing: Listing;
}

const conditionColors: Record<string, string> = {
  'New': 'badge-condition-new',
  'Like New': 'badge-condition-like-new',
  'Good': 'badge-condition-good',
  'Fair': 'badge-condition-fair',
  'Needs Repair': 'badge-condition-needs-repair',
};

const typeConfig = {
  Sell: { badge: 'badge-sell', icon: Tag, label: 'For Sale' },
  Donate: { badge: 'badge-donate', icon: Gift, label: 'Free' },
  Exchange: { badge: 'badge-exchange', icon: ArrowRightLeft, label: 'Exchange' },
};

const placeholderImages: Record<string, string> = {
  'Electronics & Gadgets': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
  'Books & Stationery': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
  'Furniture & Home Decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  'Clothing & Accessories': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
  'Sports & Outdoor': 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcfa8?w=400&h=300&fit=crop',
  'Bicycles & Vehicles': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop',
  'Household Appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  'Toys & Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
  'Musical Instruments': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
  'Other': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
};

export default function ListingCard({ listing }: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const seller = listing.sellerId as UserType;
  const config = typeConfig[listing.listingType];
  const TypeIcon = config.icon;

  const imageUrl = listing.primaryImage || listing.images?.[0] || placeholderImages[listing.category] || placeholderImages['Other'];

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/listings/${listing._id}/favorite`);
      setLiked(data.favorited);
    } catch {}
  };

  return (
    <Link to={`/listings/${listing._id}`} className="group">
      <div className="glass-card overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${config.badge} flex items-center gap-1`}>
              <TypeIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>

          {/* Favorite button */}
          {isAuthenticated && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-dark-900/60 backdrop-blur-sm flex items-center justify-center hover:bg-dark-900/80 transition-all"
            >
              <Heart className={`w-4 h-4 transition-colors ${liked ? 'text-red-400 fill-red-400' : 'text-white'}`} />
            </button>
          )}

          {/* Price/Free overlay */}
          <div className="absolute bottom-3 left-3">
            {listing.listingType === 'Sell' && listing.price ? (
              <span className="px-3 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg text-lg font-bold text-white">
                ₹{listing.price.toLocaleString('en-IN')}
              </span>
            ) : listing.listingType === 'Donate' ? (
              <span className="px-3 py-1 bg-accent-500/90 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                FREE
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                SWAP
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-dark-100 line-clamp-2 mb-2 group-hover:text-primary-400 transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className={`badge text-[10px] ${conditionColors[listing.condition]}`}>
              {listing.condition}
            </span>
            {listing.brand && (
              <span className="text-xs text-dark-400">{listing.brand}</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between">
            {/* Seller */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-[10px] text-white font-semibold overflow-hidden">
                {seller?.avatar ? (
                  <img src={seller.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  seller?.firstName?.[0] || '?'
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-dark-400">{seller?.firstName || 'User'}</span>
                {seller?.rating?.averageRating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-accent-400">
                    <Star className="w-3 h-3 fill-accent-400" />
                    {seller.rating.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {listing.location?.city && (
              <span className="flex items-center gap-1 text-xs text-dark-500">
                <MapPin className="w-3 h-3" />
                {listing.location.city}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
