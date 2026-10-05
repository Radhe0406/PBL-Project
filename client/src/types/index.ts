export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  bio: string;
  location: Location;
  accountType: 'Seller' | 'Buyer' | 'Both';
  role: 'user' | 'admin';
  authMethod: 'EmailPassword' | 'Digilocker';
  verifications: {
    email: boolean;
    phone: boolean;
    digilocker: boolean;
    idProof: boolean;
  };
  rating: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<string, number>;
  };
  sustainabilityMetrics: SustainabilityMetrics;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    profileVisibility: 'Public' | 'Private';
  };
  favorites: string[];
  lastLogin?: string;
  status: 'Active' | 'Suspended' | 'Deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  city: string;
  area: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface SustainabilityMetrics {
  itemsReused: number;
  wasteDiverted: number;
  co2Avoided: number;
  waterSaved: number;
  pointsEarned: number;
}

export type ListingCategory =
  | 'Electronics & Gadgets'
  | 'Books & Stationery'
  | 'Furniture & Home Decor'
  | 'Clothing & Accessories'
  | 'Sports & Outdoor'
  | 'Bicycles & Vehicles'
  | 'Household Appliances'
  | 'Toys & Gaming'
  | 'Beauty & Personal Care'
  | 'Musical Instruments'
  | 'Other';

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Needs Repair';
export type ListingType = 'Sell' | 'Donate' | 'Exchange';
export type ListingStatus = 'Active' | 'Sold' | 'Donated' | 'Exchanged' | 'Paused' | 'Archived' | 'Flagged';

export interface Listing {
  _id: string;
  id?: string;
  sellerId: User | string;
  title: string;
  description: string;
  category: ListingCategory;
  subCategory?: string;
  condition: ListingCondition;
  listingType: ListingType;
  price: number | null;
  currency: string;
  exchangePreferences?: string;
  brand?: string;
  yearOfPurchase?: number;
  originalPrice?: number;
  images: string[];
  primaryImage: string;
  tags: string[];
  location: Location;
  pickupPreferences: string[];
  status: ListingStatus;
  viewCount: number;
  favoriteCount: number;
  sustainabilityMetrics: {
    wasteDivertedKg: number;
    co2AvoidedKg: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeProposal {
  _id: string;
  initiatorId: User | string;
  responderId: User | string;
  initiatorListingId: Listing | string;
  responderListingId: Listing | string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  _id: string;
  requesterId: User | string;
  donorId: User | string;
  listingId: Listing | string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  listingId?: Listing;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadForMe?: number;
  otherParticipant?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User | string;
  recipientId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Review {
  _id: string;
  reviewerId: User | string;
  revieweeId: string;
  rating: number;
  comment: string;
  relatedListingId?: Listing | string;
  relatedTransactionType?: 'Sale' | 'Donation' | 'Exchange';
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  thumbnail: string;
  read: boolean;
  actionUrl: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  reporterId: User | string;
  reportType: 'Listing' | 'User' | 'Message';
  targetId: string;
  reason: string;
  details: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Dismissed';
  adminNotes: string;
  actionTaken: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  threshold?: { field: string; value: number };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const CATEGORIES: ListingCategory[] = [
  'Electronics & Gadgets',
  'Books & Stationery',
  'Furniture & Home Decor',
  'Clothing & Accessories',
  'Sports & Outdoor',
  'Bicycles & Vehicles',
  'Household Appliances',
  'Toys & Gaming',
  'Beauty & Personal Care',
  'Musical Instruments',
  'Other',
];

export const CONDITIONS: ListingCondition[] = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];

export const CATEGORY_ICONS: Record<string, string> = {
  'Electronics & Gadgets': '💻',
  'Books & Stationery': '📚',
  'Furniture & Home Decor': '🛋️',
  'Clothing & Accessories': '👗',
  'Sports & Outdoor': '⚽',
  'Bicycles & Vehicles': '🚲',
  'Household Appliances': '🏠',
  'Toys & Gaming': '🎮',
  'Beauty & Personal Care': '💄',
  'Musical Instruments': '🎸',
  'Other': '📦',
};
