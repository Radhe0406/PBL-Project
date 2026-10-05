# ReLoop — Circular Economy Marketplace
## Professional Technical Specification

---

## I. PROJECT OVERVIEW

**Product Name:** ReLoop

**Objective:** A community-driven digital marketplace enabling peer-to-peer reuse, donation, and exchange of pre-owned items to extend product lifecycles, reduce waste, and promote circular economy principles.

**Core Proposition:** Users can list items for sale, donate items to community members, or exchange items without monetary transactions. The platform quantifies and displays environmental impact metrics to incentivize sustainable behavior.

**Target Users:** Students, families, eco-conscious consumers, local communities, and small resellers seeking affordable or sustainable alternatives to new products.

---

## II. TECHNOLOGY STACK

### Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS with component-level customization
- **State Management:** Context API or Redux Toolkit
- **Build Tool:** Vite
- **Package Manager:** npm or yarn
- **UI Components:** Radix UI or Headless UI
- **Form Handling:** React Hook Form with Zod validation
- **HTTP Client:** Axios
- **Routing:** React Router v6+
- **Image Optimization:** Next Image patterns or sharp

### Backend
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with refresh tokens, OAuth 2.0 integration
- **File Storage:** Cloudinary or AWS S3
- **API Architecture:** RESTful with pagination and filtering
- **Environment Configuration:** dotenv
- **Logging:** Winston or Pino
- **Validation:** Joi or express-validator

### DevOps & Infrastructure
- **Version Control:** Git
- **Deployment:** Docker containerization (optional)
- **Environment:** Development, Staging, Production
- **API Documentation:** Swagger/OpenAPI specification

---

## III. AUTHENTICATION & USER MANAGEMENT

### 3.1 Login System

**Two User Roles:**
- **Seller/Donor:** Can list items, manage inventory, accept exchanges
- **Buyer:** Can browse, request items, initiate exchanges

**Authentication Methods:**
1. **Email/Password Login**
   - Input validation (email format, password strength)
   - Password hashing using bcrypt
   - Session persistence via JWT tokens
   - Forgot password flow with email verification

2. **Digilocker OAuth 2.0 Integration**
   - Server-side OAuth authorization code flow
   - Digilocker API endpoints integration
   - Access token retrieval and user identity verification
   - Automatic user profile creation from Digilocker identity
   - Token refresh mechanism
   - Secure credential storage (never expose client secrets)

**Session Management:**
- JWT access tokens (15-30 minute expiry)
- Refresh tokens stored in secure HttpOnly cookies
- Token rotation on refresh
- Logout endpoint clearing refresh tokens

### 3.2 Registration Flow

**User Input Collection:**
- Full name
- Email address
- Phone number (optional, for contact verification)
- Location (city, area)
- Password (minimum 8 characters, mixed case, numbers, symbols)
- Account type (Buyer/Seller)
- Terms acceptance

**Validation Logic:**
- Unique email verification against database
- Phone number format validation (country-specific)
- Password strength validation
- Location verification against supported regions

**Post-Registration:**
- Email verification link sent
- User account in "unverified" status until email confirmation
- Default user profile created
- Welcome notification sent

### 3.3 Digilocker Integration

**API Configuration:**
- Base URL: Digilocker Production/Sandbox endpoint
- Client ID and Secret stored in environment variables
- Redirect URI: `{APP_URL}/auth/digilocker/callback`

**OAuth Flow Implementation:**
1. Frontend initiates login via Digilocker button
2. User redirected to Digilocker consent screen
3. Backend receives authorization code
4. Backend exchanges code for access token
5. Backend retrieves user identity from Digilocker API
6. User record created or matched in database
7. JWT tokens generated and sent to frontend
8. User redirected to dashboard

**Data Retrieved from Digilocker:**
- Verified name
- Verified phone number (if available in issued documents)
- Verified address (if available in issued documents)
- Unique Digilocker identifier
- Authentication timestamp

**Security Considerations:**
- All Digilocker API calls occur server-side only
- Client secrets never exposed to frontend
- HTTPS enforcement
- CSRF protection on OAuth endpoints
- State parameter validation to prevent CSRF attacks

---

## IV. ITEM LISTING MANAGEMENT

### 4.1 Listing Data Model

**Mandatory Fields:**
- Title (string, 5-100 characters)
- Category (predefined enumeration)
- Description (string, 20-2000 characters)
- Condition (enumeration: New, Like New, Good, Fair, Needs Repair)
- Listing type (Sell, Donate, Exchange)

**Conditional Fields by Listing Type:**
- **Sell:** Price in INR (integer, greater than 0)
- **Donate:** None additional
- **Exchange:** Preferred item description or category preferences

**Optional Fields:**
- Brand name
- Year of purchase
- Original price (for reference)
- Item images (1-10 images, jpg/png, max 5MB each)
- Tags (user-defined keywords)

**Automated Fields:**
- Seller user ID (from authenticated session)
- Creation timestamp
- Last updated timestamp
- View count
- Favorite count
- Listing status (Active, Sold, Donated, Exchanged, Paused)

### 4.2 Item Categories

Predefined taxonomy:
- Electronics & Gadgets
- Books & Stationery
- Furniture & Home Decor
- Clothing & Accessories
- Sports & Outdoor
- Bicycles & Vehicles
- Household Appliances
- Toys & Gaming
- Beauty & Personal Care
- Musical Instruments
- Other

### 4.3 Listing Creation Workflow

**Step 1: Listing Type Selection**
- Radio button selection between Sell, Donate, Exchange
- Brief descriptions of each option and associated actions

**Step 2: Item Details Form**
- Title input with character counter
- Category dropdown with hierarchical support
- Condition radio buttons with visual indicators
- Description textarea with character counter
- Conditional fields based on listing type selection
- Brand and purchase metadata fields

**Step 3: Image Upload**
- Drag-and-drop area for multiple images
- File type validation (jpg, png)
- File size validation (individual max 5MB, total max 50MB)
- Image preview thumbnails
- Reorder capability
- Delete individual images option
- First image designated as primary thumbnail

**Step 4: Location & Pickup**
- City selector (populated from user profile default)
- Area/Locality text input with autocomplete
- PIN code input
- Pickup preferences (radio selection):
  - Buyer collects
  - Seller delivers
  - Both available
- Location visibility toggle (public/private)

**Step 5: Preview & Confirmation**
- Read-only preview of listing as it will appear in marketplace
- Summary of all entered data
- Estimated environmental impact (if applicable)
- Terms acceptance checkbox
- Publish/Save as Draft button

**Form Validation:**
- Real-time field validation with inline error messages
- Submission-blocking validation for required fields
- Image upload progress indication
- Success notification on listing creation

### 4.4 Listing Management

**User Dashboard Sections:**
- Active Listings (paginated, sortable)
- Sold/Donated/Exchanged (historical records)
- Draft Listings (unpublished items)

**Actions per Listing:**
- Edit (modify details, images, price, description)
- Republish (if expired or paused)
- Pause (temporarily hide from marketplace)
- Delete (remove permanently)
- View Analytics (view count, favorite count, inquiries)

---

## V. MARKETPLACE & DISCOVERY

### 5.1 Marketplace Layout

**Header Section:**
- Search bar with autocomplete
- Location selector (city-based filtering)
- Category dropdown
- Sorting dropdown (relevance, newest, price low-to-high, price high-to-low)
- Advanced filter button

**Main Content:**
- Responsive grid layout:
  - Desktop: 4 columns
  - Tablet: 2-3 columns
  - Mobile: 1-2 columns
- Lazy loading for performance
- Infinite scroll or pagination

### 5.2 Product Card Component

**Card Elements:**
- Primary image with hover zoom
- Item title (truncated if exceeds 2 lines)
- Price (for Sell listings) OR badge indicator (Free for Donate, Exchange icon)
- Condition badge (color-coded)
- Distance from user (if location data available)
- Seller name with avatar
- Seller rating (0-5 stars)
- Listing type badge (visual distinction)
- Heart/favorite button (toggleable)

**Card Interactivity:**
- Click to view full product details
- Hover effects showing seller quick info
- Right-click context menu for sharing/reporting

### 5.3 Search Functionality

**Search Features:**
- Text search across title and description
- Autocomplete suggestions based on popular queries
- Search history (stored client-side)
- "Did you mean" correction (if applicable)

**Query Parameters:**
- Keyword (string)
- Category (array of selected categories)
- Listing type (checkboxes for Sell/Donate/Exchange)
- Condition (checkboxes for each condition type)
- Price range (slider or input fields, if applicable)
- Distance/Location radius (if user location available)
- Seller rating minimum threshold (slider)
- Sort order (relevance, date, price)

**Search Results:**
- Result count display
- No results state with suggestions to refine search
- Filters applied display with clear options
- Search term highlighting in results

### 5.4 Category Filtering

**Filter Panel:**
- Expandable/collapsible categories
- Checkbox selection for multiple categories
- Category-specific sub-filters (e.g., size for clothing, format for books)
- Filter count badges
- Clear all filters button

**Applied Filters Display:**
- Active filters shown above results
- Individual filter removal capability
- Clear all option

### 5.5 Sorting Options

- **Relevance:** Algorithm-based (view count, recency, seller rating)
- **Newest First:** By creation timestamp, descending
- **Price Low to High:** For sale listings only
- **Price High to Low:** For sale listings only
- **Rating:** By seller rating, descending
- **Distance:** By proximity to user location

---

## VI. PRODUCT DETAIL PAGE

### 6.1 Product Detail View

**Top Section:**
- Image gallery (primary large image with thumbnails)
- Prev/next navigation or thumbnail carousel
- Zoom functionality on primary image
- Image indicators (current image number / total)

**Information Panel:**
- Item title
- Seller name with linked profile
- Seller rating and review count
- Seller "member since" date
- Seller verification badge (Digilocker verified, email verified)
- Item condition with visual indicator
- Item category and subcategory tags
- Location with distance display

**Details Section:**
- Full description text
- Structured metadata:
  - Brand (if provided)
  - Year of purchase (if provided)
  - Original price (if provided)
  - Condition details (if applicable)
- Environmental impact metrics (items reused impact, estimated waste diverted, CO₂ avoided)

**Action Buttons:**
- **For Sale:** "Contact Seller" button → opens chat/messaging
- **For Donation:** "Request Item" button → sends donation request
- **For Exchange:** "Propose Exchange" button → exchange proposal form
- Save to Wishlist (toggleable heart button)
- Share button (copy link, social sharing, QR code)
- Report button (drops to modal with reporting reasons)

**Trust Section:**
- Seller reviews/ratings list (paginated)
- Individual review with star rating, comment, buyer name
- "Verified Purchase" badge on applicable reviews

### 6.2 Exchange Proposal Modal

**For Exchange Listings:**
- Display requested item details
- Input field or selector for user's offered item
- Item condition confirmation
- Message box for additional notes
- Send proposal button

**Proposal Tracking:**
- List of pending exchange proposals
- Proposal status (pending, accepted, rejected)
- Counteroffer capability

---

## VII. DONATION SYSTEM

### 7.1 Donation Listing Page

**Page Structure:**
- Hero section highlighting donation impact
- Filter panel (category, condition, location, date posted)
- Donation item grid with similar card structure to marketplace

**Donation Card Variants:**
- Item image and title
- Donor name (anonymized option available)
- Location and distance
- Condition indicator
- "Request Donation" button
- Posted date
- Verification status of donor

### 7.2 Donation Request Flow

**Request Initiation:**
- Click "Request Donation" button
- Modal appears with:
  - Item details summary
  - User confirmation (ensure signed in)
  - Message box (optional reason for request)
  - Submit button

**Post-Request:**
- Confirmation notification
- Request added to user dashboard
- Donor receives notification of request
- Status shown as "Pending Approval"

**Donor Actions:**
- Approve request → exchange instructions
- Reject request → optional message to requester
- Request marked as "Completed" after claimed

---

## VIII. EXCHANGE SYSTEM

### 8.1 Exchange Marketplace

**Page Structure:**
- Dedicated exchange browsing interface
- Filter for items users wish to exchange for
- Display of what owners are seeking

**Exchange Item Card:**
- Item being offered (with image, title, condition)
- Desired item description or category preferences
- Proposer profile
- "Propose Swap" button

### 8.2 Exchange Request & Proposal

**Proposal Form:**
- Offered item selection (dropdown from user's active exchange items or new submission)
- Item details confirmation
- Message field for context
- Agree to terms checkbox
- Send proposal button

**Proposal Status Tracking:**
- Dashboard section showing:
  - Sent proposals (pending, accepted, rejected)
  - Received proposals (pending, accepted, rejected)
- Proposal age indicator
- Action buttons per proposal:
  - Accept/Reject for received proposals
  - Cancel for sent proposals
  - Counteroffer option

**Completed Exchange:**
- Email notification
- Contact details exchange between parties
- Completion confirmation form (optional)
- Environmental impact update to user profile

---

## IX. USER DASHBOARD & PROFILE

### 9.1 Dashboard Navigation

**Sidebar/Tab Navigation:**
- My Listings
- My Activity
- Messages
- Notifications
- Sustainability Impact
- Profile Settings
- Account Management

### 9.2 My Listings Section

**Tabs:**
- **Active:** Published listings available for interaction
- **Sold/Donated/Exchanged:** Historical records of completed transactions
- **Drafts:** Unpublished work-in-progress listings
- **Archived:** Manually hidden listings

**Listing Management:**
- Table or card view with sortable columns
- Bulk actions (pause, delete, feature)
- Edit quick links
- View analytics per listing (views, favorites, inquiries)
- Quick stats per listing (status, age, interactions)

### 9.3 My Activity Section

**Activity Log:**
- Paginated history of user interactions:
  - Purchase inquiries sent
  - Donation requests made
  - Exchange proposals sent/received
  - Completed transactions
  - Items saved/favorited
- Date-based grouping
- Activity filtering by type

### 9.4 Profile Section

**Profile Information:**
- Avatar upload (optional)
- Full name
- Email address (read-only if verified via Digilocker)
- Phone number (read-only if verified via Digilocker)
- Location (city, area)
- Bio (optional, 200 characters max)
- Website URL (optional)

**Verification Badges:**
- Email verified (checkmark)
- Phone verified (checkmark)
- Digilocker verified (green badge with verification date)
- ID proof verified (if future implementation)

**Preference Settings:**
- Email notification preferences (checkboxes for notification types)
- Privacy settings (profile visibility, listing visibility by default)
- Payment/shipping preferences
- Account status display

### 9.5 Settings & Account Management

**Account Actions:**
- Change password (if using email login)
- Linked accounts (display connected Digilocker account)
- Disconnect Digilocker option
- Download personal data (export option)
- Deactivate account
- Delete account (irreversible)

**Notifications Settings:**
- New inquiries
- Successful exchanges
- Donation requests
- Platform announcements
- Weekly digest (toggle)

---

## X. SUSTAINABILITY & IMPACT DASHBOARD

### 10.1 Impact Metrics Display

**Personal Impact Section:**
- **Items Reused:** Count of items the user has sold, donated, or exchanged
- **Waste Diverted (kg):** Calculated based on item category averages
- **CO₂ Emissions Avoided (kg):** Calculated based on manufacturing and transportation emissions savings
- **Water Conserved (liters):** For applicable product categories

**Visual Representations:**
- Progress rings or circular gauges for each metric
- Month-over-month comparison charts
- Year-to-date summary
- Contribution percentile (e.g., "Top 15% of sustainable users")

### 10.2 Achievement Badges

**Gamification System:**
- Reuse Champion (10+ items reused)
- Eco Contributor (500+ kg waste diverted)
- Circular Hero (1000+ kg waste diverted)
- Community Helper (5+ donations made)
- Exchange Expert (10+ successful exchanges)
- Consistent Contributor (active in all 4 weeks of month)

**Badge Display:**
- Earned badges on profile
- Achievement notifications when earned
- Shareable achievement cards (optional)

### 10.3 Community Impact Section

**Platform-Wide Metrics:**
- Total items reused across platform
- Total waste diverted (platform aggregate)
- Total CO₂ avoided (platform aggregate)
- Active community members
- City/region-specific breakdown (if applicable)

---

## XI. MESSAGING & COMMUNICATION

### 11.1 Messaging System

**Chat List:**
- Conversation threads ordered by most recent
- Other user avatar and name
- Last message preview
- Timestamp of last message
- Unread message indicator (badge)
- Search conversations

**Individual Chat:**
- Conversation header with user name and profile link
- Message history (threaded, chronological)
- Messages from current user aligned right (different color/background)
- Messages from other user aligned left
- Timestamps on messages (relative format: "2 hours ago")
- Online status indicator
- Typing indicator

**Message Composition:**
- Text input field with character limit display
- Emoji picker button (optional)
- Attachment button for sharing listing links (if applicable)
- Send button (disabled until text entered)

### 11.2 Conversation Context

**Linked Context:**
- Messages initiated from listing detail show listing preview
- Quick actions within chat:
  - View listing
  - Propose exchange
  - Request item
  - View seller profile

---

## XII. NOTIFICATIONS SYSTEM

### 12.1 Notification Types

**Listing Interactions:**
- New inquiry on listing
- Listing viewed
- Item favorited by user

**Exchange & Donation:**
- Exchange proposal received
- Exchange proposal accepted/rejected
- Donation request received
- Donation request accepted/rejected
- Counteroffer received

**Account Activity:**
- Login from new device
- Profile updated
- Verification status changed

**Achievements:**
- Badge earned
- Milestone achieved (e.g., 10 items reused)

**Platform Updates:**
- Community milestones
- Feature announcements
- Promotional announcements (if applicable)

### 12.2 Notification Delivery

**UI Components:**
- Bell icon in header with unread count badge
- Dropdown notification panel (last 10 notifications)
- "View All" link to full notifications page
- Notification card layout showing:
  - Icon/thumbnail
  - Notification message
  - Timestamp
  - Action button (if applicable)
  - Dismiss option

**Notification Page:**
- Paginated list of all notifications
- Filtering by notification type
- Mark as read/unread actions
- Bulk actions (clear all, clear type)
- Date-based grouping

---

## XIII. TRUST & SAFETY FRAMEWORK

### 13.1 User Verification

**Verification Indicators:**
- Email verified badge (email confirmation sent and clicked)
- Phone verified badge (SMS OTP verification)
- Digilocker verified badge (government ID verification via Digilocker)
- Transaction history display (number of successful transactions)
- Member duration badge (account creation date)

### 13.2 Rating & Review System

**Seller/Donor Rating:**
- 5-star rating system
- Submitted after transaction completion
- Required comment field (minimum 10 characters, maximum 500)
- Optional photo upload with review
- Review displays buyer name (or anonymously)
- Timestamp on review

**Rating Algorithm:**
- Average rating displayed prominently
- Rating distribution histogram (% of 5-star, 4-star, etc.)
- Total review count
- Rating filters on marketplace (minimum rating selector)

### 13.3 Reporting Mechanism

**Report Types:**
- Inappropriate content
- Suspicious/scam listing
- Offensive behavior
- Misleading description
- Non-responsive user
- Other (with explanation)

**Report Modal:**
- Dropdown to select report reason
- Text area for details
- Optional attachment
- Submit button
- Confirmation message
- Assurance that reports are reviewed

**Admin Handling:**
- Report visibility in admin dashboard
- Status tracking (pending, under review, resolved, dismissed)
- Action options (warn user, remove listing, suspend account)

---

## XIV. RESPONSIVE DESIGN REQUIREMENTS

### 14.1 Breakpoints

- **Mobile:** 0–640px (single column layouts, bottom navigation)
- **Tablet:** 641–1024px (adjusted grid layouts, sidebar navigation optional)
- **Desktop:** 1025px+ (multi-column layouts, full featured interface)

### 14.2 Mobile Optimization

- Touch-friendly button sizes (minimum 44×44px)
- Bottom navigation bar for primary sections
- Hamburger menu for secondary options
- Simplified forms (stacked inputs)
- Prioritized information (hide secondary details)
- Full-width cards and buttons
- Optimized image sizes for bandwidth

### 14.3 Tablet Optimization

- Two-column layouts where applicable
- Sticky navigation options
- Accessible sidebar (toggleable)
- Optimized grid (2 columns for product cards)

---

## XV. ADMIN DASHBOARD

### 15.1 Dashboard Overview

**Key Metrics Cards:**
- Total users (with growth indicator)
- Active listings
- Completed transactions
- Platform engagement rate
- Reported content count
- Unverified users count

### 15.2 User Management

**User List:**
- Searchable user table/cards
- Filter by verification status
- Filter by account age
- Filter by activity level
- Bulk actions (verify, suspend, delete)

**User Actions:**
- View detailed user profile
- Verify email/phone
- Approve/reject Digilocker verification
- Send message to user
- Suspend user account
- Delete user and associated data

### 15.3 Listing Moderation

**Pending Listings:**
- Listings flagged for review
- Listing details and images
- Flag reason display
- Approve or reject action
- Optional message to user

**Reported Listings:**
- Listings with user reports
- Report reasons and count
- Report details view
- Approve/reject/remove actions
- Temporary hide pending review

### 15.4 Content Moderation

**Reported Users:**
- List of users with reports
- Report reasons aggregated
- Warning history
- Actions (warn, suspend, delete)

**Reported Messages:**
- Inappropriate communication
- Messages with context
- Action options (warn sender, remove conversation)

### 15.5 Analytics

**Engagement Metrics:**
- Daily active users
- Marketplace traffic
- Search query trends
- Category popularity
- Average listing duration until exchange/donation/sale

**Impact Metrics:**
- Total items reused
- Total waste diverted
- Total CO₂ avoided
- Regional breakdowns
- Trend charts (line graphs)

### 15.6 System Health

**Monitoring:**
- Database performance indicators
- API response times
- File storage usage
- Error rate tracking
- User complaint count

---

## XVI. DATA MODELS & DATABASE SCHEMA

### 16.1 User Collection

```
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phoneNumber: String,
  passwordHash: String (optional, if email/password auth),
  avatar: String (URL),
  bio: String,
  location: {
    city: String,
    area: String,
    pincode: String
  },
  accountType: Enum (Seller, Buyer), // can be both
  authMethod: Enum (EmailPassword, Digilocker),
  digilockerData: {
    digilockerUID: String (unique, if OAuth),
    verifiedName: String,
    verifiedPhone: String,
    verifiedAddress: String,
    verificationDate: Date
  },
  verifications: {
    email: Boolean,
    phone: Boolean,
    digilocker: Boolean,
    idProof: Boolean
  },
  rating: {
    averageRating: Float (0-5),
    totalReviews: Integer,
    ratingBreakdown: Object
  },
  sustainabilityMetrics: {
    itemsReused: Integer,
    wasteDiverted: Float,
    co2Avoided: Float,
    waterSaved: Float,
    pointsEarned: Integer
  },
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    profileVisibility: Enum (Public, Private)
  },
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  status: Enum (Active, Suspended, Deleted)
}
```

### 16.2 Listing Collection

```
{
  _id: ObjectId,
  sellerId: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  subCategory: String,
  condition: Enum (New, LikeNew, Good, Fair, NeedsRepair),
  listingType: Enum (Sell, Donate, Exchange),
  price: Number (null for Donate, optional for Exchange),
  currency: Enum (INR),
  exchangePreferences: String (if listingType = Exchange),
  brand: String,
  yearOfPurchase: Integer,
  originalPrice: Number,
  images: [String] (URLs),
  primaryImage: String,
  tags: [String],
  location: {
    city: String,
    area: String,
    pincode: String,
    latitude: Number (optional),
    longitude: Number (optional)
  },
  pickupPreferences: [Enum] (BuyerCollects, SellerDelivers),
  status: Enum (Active, Sold, Donated, Exchanged, Paused, Archived),
  viewCount: Integer,
  favoriteCount: Integer,
  sustainabilityMetrics: {
    wasteDivertedKg: Float,
    co2AvoidedKg: Float
  },
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
```

### 16.3 Exchange Proposal Collection

```
{
  _id: ObjectId,
  initiatorId: ObjectId (ref: User),
  responderId: ObjectId (ref: User),
  initiatorListingId: ObjectId (ref: Listing),
  responderListingId: ObjectId (ref: Listing),
  message: String,
  status: Enum (Pending, Accepted, Rejected, Completed, Cancelled),
  counterproposal: Object (if rejected with new proposal),
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 16.4 Donation Request Collection

```
{
  _id: ObjectId,
  requesterId: ObjectId (ref: User),
  donorId: ObjectId (ref: User),
  listingId: ObjectId (ref: Listing),
  message: String,
  status: Enum (Pending, Approved, Rejected, Completed),
  createdAt: Date,
  updatedAt: Date,
  approvedAt: Date
}
```

### 16.5 Message Collection

```
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  senderId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User),
  content: String,
  attachments: [Object] (optional),
  readAt: Date (null if unread),
  createdAt: Date
}
```

### 16.6 Review Collection

```
{
  _id: ObjectId,
  reviewerId: ObjectId (ref: User),
  revieweeId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  relatedListingId: ObjectId (ref: Listing),
  relatedTransactionType: Enum (Sale, Donation, Exchange),
  images: [String],
  createdAt: Date
}
```

### 16.7 Report Collection

```
{
  _id: ObjectId,
  reporterId: ObjectId (ref: User),
  reportType: Enum (Listing, User, Message),
  targetId: ObjectId (ref: Listing or User),
  reason: Enum (InappropriateContent, Suspicious, Offensive, Misleading, NonResponsive, Other),
  details: String,
  status: Enum (Pending, UnderReview, Resolved, Dismissed),
  adminNotes: String,
  actionTaken: Enum (None, Warning, ListingRemoved, AccountSuspended),
  createdAt: Date,
  resolvedAt: Date
}
```

---

## XVII. API ENDPOINTS SPECIFICATION

### 17.1 Authentication Endpoints

**POST** `/api/auth/register`
- Body: firstName, lastName, email, password, city, area, phoneNumber, accountType
- Response: { userId, token, refreshToken }

**POST** `/api/auth/login`
- Body: email, password
- Response: { userId, token, refreshToken, user }

**GET** `/api/auth/digilocker/authorize`
- Initiates OAuth flow to Digilocker
- Redirects to Digilocker consent page

**GET** `/api/auth/digilocker/callback`
- Handles Digilocker authorization code
- Query: code, state
- Response: Redirect to app with tokens

**POST** `/api/auth/refresh`
- Body: refreshToken
- Response: { token, refreshToken }

**POST** `/api/auth/logout`
- Headers: Authorization
- Response: { success }

**POST** `/api/auth/forgot-password`
- Body: email
- Response: { message }

**POST** `/api/auth/reset-password`
- Body: token, newPassword
- Response: { success }

### 17.2 User Endpoints

**GET** `/api/users/:userId`
- Response: User profile object

**PUT** `/api/users/:userId`
- Body: Partial user object (excluding auth fields)
- Response: Updated user object

**GET** `/api/users/:userId/ratings`
- Query: page, limit
- Response: Paginated reviews array

**GET** `/api/users/:userId/impact`
- Response: Sustainability metrics for user

**POST** `/api/users/:userId/avatar`
- Body: FormData with image file
- Response: Updated avatar URL

### 17.3 Listing Endpoints

**GET** `/api/listings`
- Query: page, limit, category, condition, listingType, minPrice, maxPrice, location, sort
- Response: Paginated listings array

**POST** `/api/listings`
- Headers: Authorization
- Body: Listing details including file uploads
- Response: Created listing object

**GET** `/api/listings/:listingId`
- Response: Full listing details

**PUT** `/api/listings/:listingId`
- Headers: Authorization
- Body: Partial listing updates
- Response: Updated listing object

**DELETE** `/api/listings/:listingId`
- Headers: Authorization
- Response: { success }

**POST** `/api/listings/:listingId/favorite`
- Headers: Authorization
- Response: { favorited: Boolean }

**GET** `/api/listings/search`
- Query: q, filters
- Response: Search results array

**POST** `/api/listings/:listingId/report`
- Headers: Authorization
- Body: reason, details
- Response: { reportId }

### 17.4 Exchange Endpoints

**POST** `/api/exchanges`
- Headers: Authorization
- Body: initiatorListingId, responderListingId, message
- Response: Created proposal object

**GET** `/api/exchanges/:proposalId`
- Response: Proposal details

**PUT** `/api/exchanges/:proposalId`
- Headers: Authorization
- Body: status (accept, reject, counteroffer)
- Response: Updated proposal

**GET** `/api/users/:userId/exchanges`
- Query: page, limit, status
- Response: Paginated proposals

### 17.5 Donation Endpoints

**POST** `/api/donations`
- Headers: Authorization
- Body: listingId, message
- Response: Created donation request

**GET** `/api/donations/:donationId`
- Response: Donation request details

**PUT** `/api/donations/:donationId`
- Headers: Authorization
- Body: status (approve, reject)
- Response: Updated donation request

**GET** `/api/users/:userId/donations`
- Query: page, limit, status
- Response: Paginated donation requests

### 17.6 Messaging Endpoints

**POST** `/api/messages`
- Headers: Authorization
- Body: recipientId, content
- Response: Created message object

**GET** `/api/conversations`
- Headers: Authorization
- Query: page, limit
- Response: User's conversation threads

**GET** `/api/conversations/:conversationId`
- Query: page, limit (for message history)
- Response: Paginated messages

**PUT** `/api/messages/:messageId/read`
- Headers: Authorization
- Response: { success }

### 17.7 Notifications Endpoints

**GET** `/api/notifications`
- Headers: Authorization
- Query: page, limit, read
- Response: Paginated notifications

**PUT** `/api/notifications/:notificationId/read`
- Headers: Authorization
- Response: { success }

**PUT** `/api/notifications/read-all`
- Headers: Authorization
- Response: { success }

### 17.8 Review Endpoints

**POST** `/api/reviews`
- Headers: Authorization
- Body: revieweeId, rating, comment, listingId, transactionType
- Response: Created review

**GET** `/api/users/:userId/reviews`
- Query: page, limit
- Response: Paginated reviews

### 17.9 Admin Endpoints

**GET** `/api/admin/dashboard`
- Headers: Authorization (admin role required)
- Response: Dashboard metrics

**GET** `/api/admin/users`
- Headers: Authorization
- Query: page, limit, status, verified
- Response: Paginated users

**PUT** `/api/admin/users/:userId`
- Headers: Authorization
- Body: action (verify, suspend, delete)
- Response: Updated user

**GET** `/api/admin/listings`
- Headers: Authorization
- Query: page, limit, status, flagged
- Response: Paginated listings

**PUT** `/api/admin/listings/:listingId`
- Headers: Authorization
- Body: action (approve, reject, remove)
- Response: Updated listing

**GET** `/api/admin/reports`
- Headers: Authorization
- Query: page, limit, status, type
- Response: Paginated reports

**PUT** `/api/admin/reports/:reportId`
- Headers: Authorization
- Body: action (resolve, dismiss)
- Response: Updated report

---

## XVIII. SECURITY REQUIREMENTS

### 18.1 Authentication & Authorization

- All password fields hashed with bcrypt (minimum 10 rounds)
- JWT tokens signed with HS256 algorithm
- Access tokens valid for 15-30 minutes
- Refresh tokens valid for 30 days, stored in HttpOnly cookies
- Role-based access control (User, Admin)
- Digilocker authorization state parameter validated
- PKCE support for OAuth flow (if required by Digilocker)

### 18.2 Data Protection

- All API endpoints require HTTPS
- Sensitive fields (passwords, tokens) never logged
- User PII encrypted at rest (if applicable)
- Database credentials stored in environment variables
- File uploads scanned for malware
- Image metadata stripped before storage

### 18.3 Validation

- Input validation on all endpoints (type, length, format)
- SQL injection prevention via parameterized queries
- XSS prevention via output encoding
- CSRF protection via state tokens on OAuth endpoints
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- Email verification link expires after 24 hours
- Password reset link expires after 1 hour

### 18.4 Third-Party Integration

- Digilocker API credentials stored securely
- No sensitive data transmitted to Digilocker beyond required fields
- Token expiry and refresh handled server-side only
- Error responses sanitized (no detailed error messages to client)

---

## XIX. PERFORMANCE REQUIREMENTS

### 19.1 Frontend Performance

- Lighthouse score target: 85+
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Code splitting by route
- Lazy loading for images
- Optimized bundle size (< 200KB gzipped)
- Caching strategy for static assets

### 19.2 Backend Performance

- API response time < 200ms (p95)
- Database query optimization with indexes
- MongoDB connection pooling
- Pagination on all list endpoints
- Image optimization and CDN delivery
- Compression enabled (gzip)

### 19.3 Scaling Considerations

- Stateless backend for horizontal scaling
- Database sharding strategy for large datasets
- Redis caching for frequently accessed data (optional)
- Image storage on CDN or S3
- Load balancing ready architecture

---

## XX. DEPLOYMENT & DEVOPS

### 20.1 Environment Configuration

**Development:**
- Local MongoDB instance
- Local file storage for images
- Digilocker sandbox credentials

**Staging:**
- Staging database (with sample data)
- Cloud storage (Cloudinary or S3 test bucket)
- Digilocker sandbox or staging credentials

**Production:**
- Production database with backups
- CDN for static assets and images
- Digilocker production credentials
- SSL certificates (auto-renewed)

### 20.2 Deployment Process

- Git-based deployment workflow
- Environment-specific configuration files
- Database migration scripts
- Docker containerization (optional)
- CI/CD pipeline with automated testing
- Rollback strategy for failed deployments

### 20.3 Monitoring & Logging

- Error tracking (Sentry or similar)
- Application performance monitoring (optional)
- Server logs aggregation
- Database performance monitoring
- Uptime monitoring
- User session tracking (privacy-compliant)

---

## XXI. TESTING REQUIREMENTS

### 21.1 Unit Tests

- Authentication functions (token generation, verification)
- Validation logic (user input, listing data)
- Utility functions
- Target: > 70% code coverage

### 21.2 Integration Tests

- User registration and login flow
- Listing creation and retrieval
- Exchange proposal workflow
- Donation request flow
- Messaging system

### 21.3 E2E Tests

- Critical user journeys (from landing to exchange completion)
- Admin operations (moderation, user management)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness testing

---

## XXII. IMPLEMENTATION PRIORITY

### Phase 1: Core Infrastructure
1. Setup project structure and tooling
2. Implement authentication (email/password + Digilocker)
3. User management system
4. Database schema and migrations

### Phase 2: Marketplace MVP
5. Item listing creation and management
6. Marketplace browsing and search
7. Product detail pages
8. User profiles

### Phase 3: Exchange & Donation
9. Exchange proposal system
10. Donation request system
11. Messaging system
12. Notifications

### Phase 4: Sustainability & Community
13. Impact dashboard and metrics
14. Community section
15. Badges and gamification
16. Leaderboards

### Phase 5: Admin & Polish
17. Admin dashboard
18. Moderation system
19. Analytics
20. Performance optimization and polish

---

## XXIII. ACCEPTANCE CRITERIA

### Functional Requirements Met:
- [ ] Email/password authentication working
- [ ] Digilocker OAuth integration complete and verified
- [ ] Item listing CRUD operations functional
- [ ] Search and category filtering implemented
- [ ] Selling flow complete
- [ ] Donation flow complete
- [ ] Exchange flow complete
- [ ] User dashboard fully operational
- [ ] Sustainability metrics calculated and displayed
- [ ] Admin dashboard operational
- [ ] Responsive design on mobile, tablet, desktop

### Code Quality:
- [ ] No console errors in browser
- [ ] Proper error handling throughout
- [ ] Input validation on all forms
- [ ] Clean code architecture with reusable components
- [ ] Environment variables for sensitive config

### Data & Content:
- [ ] Realistic sample data across all features
- [ ] No placeholder/Lorem Ipsum text
- [ ] Images present on all pages
- [ ] All interactive elements functional

### Performance:
- [ ] Page load times < 3 seconds
- [ ] Smooth interactions and animations
- [ ] Mobile performance optimized

### Security:
- [ ] HTTPS ready
- [ ] No hardcoded credentials
- [ ] Password properly hashed
- [ ] API endpoints protected with auth
- [ ] Digilocker tokens handled securely

---

## XXIV. SUCCESS METRICS

**User Adoption:**
- Successful registrations via email and Digilocker
- Active user retention
- Listing creation rate

**Platform Activity:**
- Items reused/exchanged/donated per week
- Average response time on inquiries
- Successful transaction completion rate

**Environmental Impact:**
- Aggregate waste diverted (kg)
- CO₂ emissions avoided (kg)
- Community engagement in sustainability

**Technical Health:**
- System uptime > 99%
- API response time < 200ms
- Zero critical security vulnerabilities

---

**End of Specification Document**
