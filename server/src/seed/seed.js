require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ExchangeProposal = require('../models/ExchangeProposal');
const DonationRequest = require('../models/DonationRequest');
const { calculateItemImpact } = require('../utils/sustainability');

const seed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), Listing.deleteMany({}), Review.deleteMany({}),
      Conversation.deleteMany({}), Message.deleteMany({}), Notification.deleteMany({}),
      ExchangeProposal.deleteMany({}), DonationRequest.deleteMany({})
    ]);
    console.log('Cleared all collections');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Create users
    const usersData = [
      { firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@example.com', phoneNumber: '+919876543210', location: { city: 'Mumbai', area: 'Andheri West', pincode: '400053' }, accountType: 'Both', role: 'admin', bio: 'Sustainability advocate and tech enthusiast', verifications: { email: true, phone: true, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 24, wasteDiverted: 85.5, co2Avoided: 210, waterSaved: 15000, pointsEarned: 760 }, rating: { averageRating: 4.8, totalReviews: 15, ratingBreakdown: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 11 } } },
      { firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com', phoneNumber: '+919876543211', location: { city: 'Mumbai', area: 'Bandra', pincode: '400050' }, accountType: 'Both', bio: 'Bookworm and eco-conscious shopper', verifications: { email: true, phone: true, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 18, wasteDiverted: 42, co2Avoided: 125, waterSaved: 9500, pointsEarned: 520 }, rating: { averageRating: 4.6, totalReviews: 12, ratingBreakdown: { 1: 0, 2: 1, 3: 1, 4: 2, 5: 8 } } },
      { firstName: 'Rahul', lastName: 'Kumar', email: 'rahul@example.com', phoneNumber: '+919876543212', location: { city: 'Delhi', area: 'Hauz Khas', pincode: '110016' }, accountType: 'Both', bio: 'Student | Giving back to community through ReLoop', verifications: { email: true, phone: false, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 8, wasteDiverted: 22, co2Avoided: 65, waterSaved: 4200, pointsEarned: 230 }, rating: { averageRating: 4.2, totalReviews: 6, ratingBreakdown: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 2 } } },
      { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@example.com', phoneNumber: '+919876543213', location: { city: 'Bangalore', area: 'Koramangala', pincode: '560034' }, accountType: 'Both', bio: 'Interior designer. Love upcycling furniture!', verifications: { email: true, phone: true, digilocker: true, idProof: false }, sustainabilityMetrics: { itemsReused: 32, wasteDiverted: 195, co2Avoided: 380, waterSaved: 22000, pointsEarned: 1120 }, rating: { averageRating: 4.9, totalReviews: 20, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 18 } } },
      { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@example.com', phoneNumber: '+919876543214', location: { city: 'Pune', area: 'Kothrud', pincode: '411038' }, accountType: 'Both', bio: 'Cyclist and outdoor gear swapper', verifications: { email: true, phone: false, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 12, wasteDiverted: 55, co2Avoided: 140, waterSaved: 7800, pointsEarned: 380 }, rating: { averageRating: 4.4, totalReviews: 9, ratingBreakdown: { 1: 0, 2: 0, 3: 2, 4: 3, 5: 4 } } },
      { firstName: 'Meera', lastName: 'Nair', email: 'meera@example.com', phoneNumber: '+919876543215', location: { city: 'Chennai', area: 'T Nagar', pincode: '600017' }, accountType: 'Both', bio: 'Mom of two. Passing along outgrown kids items.', verifications: { email: true, phone: true, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 45, wasteDiverted: 110, co2Avoided: 280, waterSaved: 32000, pointsEarned: 890 }, rating: { averageRating: 4.7, totalReviews: 28, ratingBreakdown: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 20 } } },
      { firstName: 'Karthik', lastName: 'Iyer', email: 'karthik@example.com', phoneNumber: '+919876543216', location: { city: 'Hyderabad', area: 'HITEC City', pincode: '500081' }, accountType: 'Both', bio: 'Tech professional. Selling my upgraded gadgets.', verifications: { email: true, phone: true, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 15, wasteDiverted: 38, co2Avoided: 175, waterSaved: 5400, pointsEarned: 510 }, rating: { averageRating: 4.5, totalReviews: 11, ratingBreakdown: { 1: 0, 2: 0, 3: 1, 4: 5, 5: 5 } } },
      { firstName: 'Ananya', lastName: 'Gupta', email: 'ananya@example.com', phoneNumber: '+919876543217', location: { city: 'Delhi', area: 'Saket', pincode: '110017' }, accountType: 'Both', bio: 'Fashion student swapping trendy accessories', verifications: { email: true, phone: false, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 22, wasteDiverted: 28, co2Avoided: 155, waterSaved: 48000, pointsEarned: 630 }, rating: { averageRating: 4.3, totalReviews: 14, ratingBreakdown: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 7 } } },
      { firstName: 'Deepak', lastName: 'Joshi', email: 'deepak@example.com', phoneNumber: '+919876543218', location: { city: 'Mumbai', area: 'Powai', pincode: '400076' }, accountType: 'Both', bio: 'Music teacher sharing instruments with students', verifications: { email: true, phone: true, digilocker: false, idProof: false }, sustainabilityMetrics: { itemsReused: 10, wasteDiverted: 48, co2Avoided: 95, waterSaved: 3200, pointsEarned: 310 }, rating: { averageRating: 4.6, totalReviews: 7, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 4 } } },
      { firstName: 'Lakshmi', lastName: 'Menon', email: 'lakshmi@example.com', phoneNumber: '+919876543219', location: { city: 'Bangalore', area: 'Indiranagar', pincode: '560038' }, accountType: 'Both', bio: 'Minimalist lifestyle. Less stuff, more life.', verifications: { email: true, phone: true, digilocker: true, idProof: true }, sustainabilityMetrics: { itemsReused: 55, wasteDiverted: 240, co2Avoided: 520, waterSaved: 38000, pointsEarned: 1590 }, rating: { averageRating: 5.0, totalReviews: 32, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 32 } } }
    ];

    const users = [];
    for (const userData of usersData) {
      const user = new User({ ...userData, passwordHash });
      await user.save();
      users.push(user);
    }
    console.log(`Created ${users.length} users`);
    console.log('Admin login: arjun@example.com / Password123!');
    console.log('User login: priya@example.com / Password123!');

    // Create listings
    const listingsData = [
      // Electronics
      { sellerId: users[6], title: 'Samsung Galaxy S22 Ultra - Excellent Condition', description: 'Selling my Samsung Galaxy S22 Ultra 256GB in Phantom Black. Used for 8 months, always had a screen protector and case. Battery health is excellent. Comes with original charger and box. No scratches or dents. Upgrading to the new model so letting this go at a great price.', category: 'Electronics & Gadgets', condition: 'Like New', listingType: 'Sell', price: 42000, brand: 'Samsung', yearOfPurchase: 2024, originalPrice: 109999, tags: ['samsung', 'smartphone', 'android', 'galaxy'], location: { city: 'Hyderabad', area: 'HITEC City', pincode: '500081' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[0], title: 'Sony WH-1000XM4 Wireless Headphones', description: 'Premium noise-cancelling headphones in silver color. Sound quality is outstanding with deep bass and crystal clear highs. ANC works perfectly. Battery lasts 30 hours easily. Includes carrying case, charging cable, and audio cable. Selling because I received XM5 as a gift.', category: 'Electronics & Gadgets', condition: 'Good', listingType: 'Sell', price: 15500, brand: 'Sony', yearOfPurchase: 2023, originalPrice: 29990, tags: ['sony', 'headphones', 'wireless', 'noise-cancelling'], location: { city: 'Mumbai', area: 'Andheri West', pincode: '400053' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[6], title: 'Dell XPS 15 Laptop - i7 12th Gen', description: 'Dell XPS 15 with Intel i7-12700H, 16GB RAM, 512GB SSD, NVIDIA RTX 3050 Ti. Beautiful 15.6 inch OLED display. Perfect for programming, design work, or gaming. Comes with original charger and laptop sleeve. Minor cosmetic wear on the bottom panel.', category: 'Electronics & Gadgets', condition: 'Good', listingType: 'Sell', price: 78000, brand: 'Dell', yearOfPurchase: 2023, originalPrice: 159990, tags: ['laptop', 'dell', 'xps', 'gaming'], location: { city: 'Hyderabad', area: 'HITEC City', pincode: '500081' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[0], title: 'iPad Air 5th Generation WiFi 64GB', description: 'Apple iPad Air M1 chip, 64GB storage, Space Gray. Pristine condition with zero scratches. Used primarily for reading and light work. Includes Apple Pencil 2nd gen and a magnetic folio case. Everything works flawlessly. Great for students or creative professionals.', category: 'Electronics & Gadgets', condition: 'Like New', listingType: 'Sell', price: 38000, brand: 'Apple', yearOfPurchase: 2024, originalPrice: 59900, tags: ['apple', 'ipad', 'tablet', 'pencil'], location: { city: 'Mumbai', area: 'Andheri West', pincode: '400053' }, pickupPreferences: ['Both Available'] },

      // Books & Stationery
      { sellerId: users[1], title: 'Complete Harry Potter Box Set (7 Books)', description: 'The complete Harry Potter series by J.K. Rowling, paperback edition. All seven books in good reading condition. Some spine creasing on the first two books but pages are clean and intact. Perfect for a new Potter fan or collector. These stories changed my life and I hope they change yours too.', category: 'Books & Stationery', condition: 'Good', listingType: 'Sell', price: 1800, brand: 'Bloomsbury', tags: ['harry-potter', 'fiction', 'fantasy', 'box-set'], location: { city: 'Mumbai', area: 'Bandra', pincode: '400050' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[1], title: 'Engineering Mathematics Reference Books Bundle', description: 'Set of 5 engineering mathematics textbooks covering calculus, linear algebra, differential equations, probability, and numerical methods. All books are by well-known Indian authors. Minimal highlighting, no torn pages. Ideal for BTech/BE students preparing for university exams.', category: 'Books & Stationery', condition: 'Good', listingType: 'Donate', tags: ['engineering', 'mathematics', 'textbooks', 'education'], location: { city: 'Mumbai', area: 'Bandra', pincode: '400050' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[2], title: 'Atomic Habits by James Clear - Hardcover', description: 'International bestseller Atomic Habits in hardcover edition. Read once, in like-new condition. This book genuinely transformed my daily routines. Passing it forward so someone else can benefit from the powerful habit-building framework inside.', category: 'Books & Stationery', condition: 'Like New', listingType: 'Donate', tags: ['self-help', 'habits', 'productivity', 'bestseller'], location: { city: 'Delhi', area: 'Hauz Khas', pincode: '110016' }, pickupPreferences: ['Both Available'] },

      // Furniture & Home Decor
      { sellerId: users[3], title: 'Solid Teak Wood Study Desk with Drawers', description: 'Handcrafted solid teak wood study desk with three drawers on the right side. Dimensions: 120cm x 60cm x 75cm. Beautiful grain pattern, no termite damage. Sturdy and built to last generations. Minor surface scratches that add character. Would look stunning with a coat of polish.', category: 'Furniture & Home Decor', condition: 'Good', listingType: 'Sell', price: 12000, brand: 'Custom Made', yearOfPurchase: 2020, originalPrice: 28000, tags: ['desk', 'teak', 'study', 'furniture'], location: { city: 'Bangalore', area: 'Koramangala', pincode: '560034' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[3], title: 'Vintage Brass Table Lamp with Fabric Shade', description: 'Beautiful vintage brass table lamp with a cream-colored fabric shade. The brass base has developed a gorgeous patina over the years. Stands about 50cm tall. Gives off warm ambient light, perfect for a bedside table or reading nook. Electrical wiring has been recently updated and works perfectly.', category: 'Furniture & Home Decor', condition: 'Good', listingType: 'Sell', price: 3500, tags: ['lamp', 'vintage', 'brass', 'decor'], location: { city: 'Bangalore', area: 'Koramangala', pincode: '560034' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[9], title: 'IKEA KALLAX Bookshelf 4x4 - White', description: 'IKEA KALLAX 4x4 cube shelf unit in white. Assembled and used for 1 year. All 16 compartments are in perfect shape. Includes 4 canvas storage boxes that fit perfectly. Great for organizing books, toys, office supplies, or display items. Disassembled and ready for pickup.', category: 'Furniture & Home Decor', condition: 'Like New', listingType: 'Sell', price: 6500, brand: 'IKEA', yearOfPurchase: 2024, originalPrice: 12999, tags: ['ikea', 'bookshelf', 'storage', 'organizer'], location: { city: 'Bangalore', area: 'Indiranagar', pincode: '560038' }, pickupPreferences: ['Buyer Collects'] },

      // Clothing & Accessories
      { sellerId: users[7], title: 'Vintage Denim Jacket - Levis Size M', description: 'Classic Levis denim jacket in medium wash, size M. This jacket has that perfect worn-in softness that takes years to develop. No tears or stains, buttons all intact. Vintage style from the early 2000s. Goes with literally everything - t-shirts, dresses, kurtas. A wardrobe essential.', category: 'Clothing & Accessories', condition: 'Good', listingType: 'Exchange', exchangePreferences: 'Looking for a leather jacket or a nice blazer in size M or L', tags: ['denim', 'levis', 'jacket', 'vintage'], location: { city: 'Delhi', area: 'Saket', pincode: '110017' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[7], title: 'Handwoven Pashmina Shawl - Navy Blue', description: 'Authentic handwoven Kashmiri Pashmina shawl in deep navy blue. Incredibly soft and warm. Purchased during a trip to Srinagar. Can be styled as a shawl, scarf, or wrap. Comes with a certificate of authenticity. Selling because I have too many shawls already.', category: 'Clothing & Accessories', condition: 'Like New', listingType: 'Sell', price: 8500, tags: ['pashmina', 'kashmiri', 'shawl', 'handwoven'], location: { city: 'Delhi', area: 'Saket', pincode: '110017' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[5], title: 'Kids Clothing Bundle (Age 4-5 Years)', description: 'Bundle of 15 clothing items for kids aged 4-5 years. Includes 6 t-shirts, 4 shorts, 3 pants, and 2 jackets. Mix of brands including H&M, Zara Kids, and Max. All in good condition, no stains or holes. My kids outgrew them quickly. Would love these to go to a family who can use them.', category: 'Clothing & Accessories', condition: 'Good', listingType: 'Donate', tags: ['kids', 'clothing', 'bundle', 'children'], location: { city: 'Chennai', area: 'T Nagar', pincode: '600017' }, pickupPreferences: ['Both Available'] },

      // Sports & Outdoor
      { sellerId: users[4], title: 'Trek Marlin 7 Mountain Bike 2023', description: 'Trek Marlin 7 hardtail mountain bike, size Large (29 inch wheels). Shimano Deore 1x10 drivetrain, hydraulic disc brakes, RockShox Judy fork. Used on weekend trails for about 6 months. Recently serviced with new brake pads and chain. A few scratches on the frame from trail riding but mechanically perfect.', category: 'Bicycles & Vehicles', condition: 'Good', listingType: 'Sell', price: 38000, brand: 'Trek', yearOfPurchase: 2024, originalPrice: 72999, tags: ['bicycle', 'mountain-bike', 'trek', 'cycling'], location: { city: 'Pune', area: 'Kothrud', pincode: '411038' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[4], title: 'Complete Camping Kit - 4 Person Tent + Gear', description: 'Everything you need for a camping trip: Quechua 4-person tent, 2 sleeping bags (rated to 5°C), camping stove with gas canister, LED lantern, foldable chairs (2), and a cooler bag. Used on 3 camping trips total. Tent has no leaks, all zippers work perfectly. Selling as a complete bundle only.', category: 'Sports & Outdoor', condition: 'Good', listingType: 'Sell', price: 9500, brand: 'Quechua/Decathlon', yearOfPurchase: 2023, originalPrice: 22000, tags: ['camping', 'tent', 'outdoor', 'adventure'], location: { city: 'Pune', area: 'Kothrud', pincode: '411038' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[4], title: 'Yonex Badminton Racket - Nanoray 70 Light', description: 'Professional-grade badminton racket from Yonex, the Nanoray 70 Light model. Excellent for fast swing speeds and defensive play. String tension maintained at 24 lbs. Includes racket cover and a tube of 6 shuttlecocks. Perfect for intermediate to advanced players looking for a quality racket.', category: 'Sports & Outdoor', condition: 'Good', listingType: 'Exchange', exchangePreferences: 'Looking for a good quality tennis racket or cricket bat', tags: ['badminton', 'yonex', 'racket', 'sports'], location: { city: 'Pune', area: 'Kothrud', pincode: '411038' }, pickupPreferences: ['Both Available'] },

      // Household Appliances
      { sellerId: users[5], title: 'Philips Air Fryer XXL - 7.3L Capacity', description: 'Philips Premium Air Fryer XXL with 7.3 liter capacity. Makes crispy fries, grilled chicken, and baked goods with minimal oil. Twin TurboStar technology for even cooking. Digital display with preset programs. Used for about a year, works perfectly. Includes recipe booklet and baking tray accessory.', category: 'Household Appliances', condition: 'Good', listingType: 'Sell', price: 8500, brand: 'Philips', yearOfPurchase: 2023, originalPrice: 19995, tags: ['air-fryer', 'philips', 'kitchen', 'cooking'], location: { city: 'Chennai', area: 'T Nagar', pincode: '600017' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[9], title: 'Dyson V11 Absolute Cordless Vacuum', description: 'Dyson V11 Absolute cordless vacuum cleaner. Incredibly powerful suction with intelligent cleaning modes that auto-adapt to floor type. LCD screen shows run time and performance. Includes wall mount dock, motorhead attachment, and crevice tool. Battery holds about 50 minutes of charge.', category: 'Household Appliances', condition: 'Like New', listingType: 'Sell', price: 28000, brand: 'Dyson', yearOfPurchase: 2024, originalPrice: 52900, tags: ['dyson', 'vacuum', 'cordless', 'cleaning'], location: { city: 'Bangalore', area: 'Indiranagar', pincode: '560038' }, pickupPreferences: ['Buyer Collects'] },

      // Toys & Gaming
      { sellerId: users[5], title: 'LEGO Technic Bugatti Chiron Set (42083)', description: 'LEGO Technic Bugatti Chiron 42083, fully assembled and displayed in a glass case. Over 3,500 pieces with incredible detail including working gearbox, W16 engine with moving pistons, and adjustable rear wing. Includes original box, manual, and all spare pieces. A stunning display piece for any car or LEGO enthusiast.', category: 'Toys & Gaming', condition: 'Like New', listingType: 'Sell', price: 22000, brand: 'LEGO', yearOfPurchase: 2023, originalPrice: 42999, tags: ['lego', 'technic', 'bugatti', 'collectible'], location: { city: 'Chennai', area: 'T Nagar', pincode: '600017' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[2], title: 'PS5 DualSense Controller - Midnight Black', description: 'PlayStation 5 DualSense wireless controller in Midnight Black. Haptic feedback and adaptive triggers work perfectly. Used for about 4 months of weekend gaming. No stick drift or button issues. Comes with USB-C charging cable. Selling because I switched to PC gaming.', category: 'Toys & Gaming', condition: 'Good', listingType: 'Sell', price: 4200, brand: 'Sony', yearOfPurchase: 2024, originalPrice: 5990, tags: ['ps5', 'controller', 'gaming', 'playstation'], location: { city: 'Delhi', area: 'Hauz Khas', pincode: '110016' }, pickupPreferences: ['Both Available'] },
      { sellerId: users[5], title: 'Board Games Collection (5 Games)', description: 'Collection of 5 popular board games: Catan, Ticket to Ride, Pandemic, Codenames, and Azul. All complete with no missing pieces. Game boxes have some wear from storage but all components are in excellent condition. Great for family game nights or hosting friends. Selling as a bundle.', category: 'Toys & Gaming', condition: 'Good', listingType: 'Donate', tags: ['board-games', 'catan', 'family', 'games'], location: { city: 'Chennai', area: 'T Nagar', pincode: '600017' }, pickupPreferences: ['Buyer Collects'] },

      // Beauty & Personal Care
      { sellerId: users[7], title: 'Dyson Airwrap Complete Styling Set', description: 'Dyson Airwrap Complete multi-styler in Nickel/Copper. Includes all barrel attachments, round brush, pre-styling dryer, and firm smoothing brush. Used about 10 times total. Gives salon-quality curls, waves, and smooth styles. Original storage case included. Selling because I cut my hair short.', category: 'Beauty & Personal Care', condition: 'Like New', listingType: 'Sell', price: 32000, brand: 'Dyson', yearOfPurchase: 2024, originalPrice: 45900, tags: ['dyson', 'airwrap', 'hair-styling', 'beauty'], location: { city: 'Delhi', area: 'Saket', pincode: '110017' }, pickupPreferences: ['Both Available'] },

      // Musical Instruments
      { sellerId: users[8], title: 'Yamaha F310 Acoustic Guitar with Case', description: 'Yamaha F310 full-size acoustic guitar in natural finish. One of the best beginner to intermediate guitars available. Rich, warm tone with excellent playability. Comes with padded gig bag, capo, guitar strap, extra set of strings, and a tuner. Some minor pick marks on the body but no structural issues.', category: 'Musical Instruments', condition: 'Good', listingType: 'Sell', price: 5500, brand: 'Yamaha', yearOfPurchase: 2022, originalPrice: 9990, tags: ['guitar', 'yamaha', 'acoustic', 'music'], location: { city: 'Mumbai', area: 'Powai', pincode: '400076' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[8], title: 'Roland FP-30X Digital Piano', description: 'Roland FP-30X digital piano in black. SuperNATURAL piano sound engine with 88 weighted keys that feel like a real piano. Bluetooth MIDI and audio support. Built-in speakers sound fantastic. Includes sustain pedal, music rest, and power adapter. Ideal for students and hobbyists who want authentic piano feel.', category: 'Musical Instruments', condition: 'Like New', listingType: 'Exchange', exchangePreferences: 'Looking for a synthesizer or electronic drum kit', tags: ['piano', 'roland', 'digital', 'keyboard'], location: { city: 'Mumbai', area: 'Powai', pincode: '400076' }, pickupPreferences: ['Buyer Collects'] },
      { sellerId: users[8], title: 'Harmonium - Traditional Indian Scale Changer', description: 'Beautiful handcrafted harmonium with scale changer mechanism. Double reed, 3.5 octave range, 9 stops including bass and male. Teak wood body with brass fittings. Bellows are tight with no air leaks. Perfect for classical vocal practice, bhajans, or music classes. Donating to a deserving music student.', category: 'Musical Instruments', condition: 'Good', listingType: 'Donate', tags: ['harmonium', 'classical', 'indian-music', 'instrument'], location: { city: 'Mumbai', area: 'Powai', pincode: '400076' }, pickupPreferences: ['Buyer Collects'] },

      // More Electronics
      { sellerId: users[2], title: 'JBL Charge 5 Bluetooth Speaker - Teal', description: 'JBL Charge 5 portable Bluetooth speaker in Teal color. Massive sound with deep bass and crystal highs. IP67 waterproof and dustproof, taken it to beaches and pools without any issues. Built-in powerbank to charge your phone. Battery lasts a solid 20 hours. Includes USB-C cable.', category: 'Electronics & Gadgets', condition: 'Good', listingType: 'Sell', price: 8900, brand: 'JBL', yearOfPurchase: 2024, originalPrice: 15999, tags: ['jbl', 'speaker', 'bluetooth', 'portable'], location: { city: 'Delhi', area: 'Hauz Khas', pincode: '110016' }, pickupPreferences: ['Both Available'] },

      // More Furniture
      { sellerId: users[3], title: 'Ergonomic Office Chair - Herman Miller Aeron', description: 'Herman Miller Aeron Size B ergonomic office chair. The gold standard of office seating. Fully loaded with lumbar support, adjustable arms, forward tilt. Breathable mesh keeps you cool during long work sessions. Used for about 2 years in a home office. Some normal wear on arm pads. 12-year warranty still valid.', category: 'Furniture & Home Decor', condition: 'Good', listingType: 'Sell', price: 45000, brand: 'Herman Miller', yearOfPurchase: 2023, originalPrice: 119000, tags: ['chair', 'ergonomic', 'herman-miller', 'office'], location: { city: 'Bangalore', area: 'Koramangala', pincode: '560034' }, pickupPreferences: ['Buyer Collects'] },
    ];

    const listings = [];
    for (const listingData of listingsData) {
      const impact = calculateItemImpact(listingData.category);
      const listing = new Listing({
        ...listingData,
        sellerId: listingData.sellerId._id,
        primaryImage: '',
        images: [],
        viewCount: Math.floor(Math.random() * 200) + 10,
        favoriteCount: Math.floor(Math.random() * 30),
        sustainabilityMetrics: { wasteDivertedKg: impact.wasteKg, co2AvoidedKg: impact.co2Kg }
      });
      await listing.save();
      listings.push(listing);
    }
    console.log(`Created ${listings.length} listings`);

    // Create reviews
    const reviewsData = [
      { reviewerId: users[1], revieweeId: users[0], rating: 5, comment: 'Arjun was incredibly responsive and the headphones were exactly as described. Packaging was careful too. Highly recommend!', relatedTransactionType: 'Sale' },
      { reviewerId: users[2], revieweeId: users[0], rating: 5, comment: 'Super fast delivery and the iPad was in pristine condition. Great seller with honest descriptions.', relatedTransactionType: 'Sale' },
      { reviewerId: users[0], revieweeId: users[1], rating: 4, comment: 'Priya sold me great books. Slight delay in response but overall good experience.', relatedTransactionType: 'Sale' },
      { reviewerId: users[3], revieweeId: users[1], rating: 5, comment: 'Wonderful person! Donated books to our community library. Thank you Priya!', relatedTransactionType: 'Donation' },
      { reviewerId: users[0], revieweeId: users[3], rating: 5, comment: 'Sneha is an amazing seller. The desk is beautiful and sturdy. Worth every rupee!', relatedTransactionType: 'Sale' },
      { reviewerId: users[5], revieweeId: users[3], rating: 5, comment: 'Professional and trustworthy. The lamp was even more beautiful in person. Fast communication.', relatedTransactionType: 'Sale' },
      { reviewerId: users[1], revieweeId: users[4], rating: 4, comment: 'Vikram was a great exchange partner. The badminton racket is excellent quality. Smooth transaction.', relatedTransactionType: 'Exchange' },
      { reviewerId: users[7], revieweeId: users[5], rating: 5, comment: 'Meera is so generous! The kids clothes were clean and in great condition. My daughter loves them.', relatedTransactionType: 'Donation' },
      { reviewerId: users[0], revieweeId: users[6], rating: 5, comment: 'Karthik knows his tech. The phone was exactly as described with all accessories. Fair price too.', relatedTransactionType: 'Sale' },
      { reviewerId: users[6], revieweeId: users[8], rating: 5, comment: 'Deepak is a gem. The guitar sounds beautiful and he even gave me some playing tips!', relatedTransactionType: 'Sale' },
      { reviewerId: users[3], revieweeId: users[9], rating: 5, comment: 'Lakshmi is the best! Everything was packed perfectly. The bookshelf looks amazing in my room.', relatedTransactionType: 'Sale' },
      { reviewerId: users[4], revieweeId: users[9], rating: 5, comment: 'Incredible seller. The Dyson vacuum works like new. Very fair pricing and quick to respond.', relatedTransactionType: 'Sale' },
    ];

    for (const reviewData of reviewsData) {
      const review = new Review({
        ...reviewData,
        reviewerId: reviewData.reviewerId._id,
        revieweeId: reviewData.revieweeId._id,
        relatedListingId: listings[Math.floor(Math.random() * listings.length)]._id
      });
      await review.save();
    }
    console.log(`Created ${reviewsData.length} reviews`);

    // Create conversations and messages
    const conversationPairs = [
      { user1: users[0], user2: users[1], listing: listings[4] },
      { user1: users[2], user2: users[0], listing: listings[3] },
      { user1: users[3], user2: users[4], listing: listings[14] },
      { user1: users[5], user2: users[7], listing: listings[12] },
    ];

    const messageTexts = [
      ['Hi, is this item still available?', 'Yes it is! Are you interested?', 'Definitely! Can we meet this weekend for pickup?', 'Sure, Saturday afternoon works for me. I will share my location.', 'Perfect, see you then!'],
      ['Hello! I love this item. Is the price negotiable?', 'Hi! I can offer a small discount. What price works for you?', 'How about 10% off? I can pick it up today.', 'That works for me. Let me know when you are on the way.'],
      ['Hey, I saw your exchange listing. I have something you might like!', 'Oh nice! What do you have?', 'I have a Wilson tennis racket, professional grade. Used it for a season.', 'That sounds great! Can you send some photos?', 'Sure, I will upload them to my listing right away.'],
      ['Hi Meera, thank you for donating the kids clothes! My daughter will love them.', 'You are welcome Ananya! Happy they will go to good use.', 'She already picked out her favorites from the photos. When can I collect?', 'Anytime this week after 4pm works for me.']
    ];

    for (let i = 0; i < conversationPairs.length; i++) {
      const { user1, user2, listing } = conversationPairs[i];
      const conv = new Conversation({
        participants: [user1._id, user2._id],
        listingId: listing._id,
        lastMessage: {
          content: messageTexts[i][messageTexts[i].length - 1],
          senderId: i % 2 === 0 ? user1._id : user2._id,
          createdAt: new Date()
        }
      });
      await conv.save();

      for (let j = 0; j < messageTexts[i].length; j++) {
        const sender = j % 2 === 0 ? user1 : user2;
        const recipient = j % 2 === 0 ? user2 : user1;
        const msg = new Message({
          conversationId: conv._id,
          senderId: sender._id,
          recipientId: recipient._id,
          content: messageTexts[i][j],
          readAt: j < messageTexts[i].length - 1 ? new Date() : null,
          createdAt: new Date(Date.now() - (messageTexts[i].length - j) * 3600000)
        });
        await msg.save();
      }
    }
    console.log('Created conversations and messages');

    // Create exchange proposals
    const exchange1 = new ExchangeProposal({
      initiatorId: users[1]._id,
      responderId: users[4]._id,
      initiatorListingId: listings[4]._id,
      responderListingId: listings[16]._id,
      message: 'I would love to swap my Harry Potter set for your badminton racket. My kids would enjoy playing!',
      status: 'Pending'
    });
    await exchange1.save();

    const exchange2 = new ExchangeProposal({
      initiatorId: users[6]._id,
      responderId: users[8]._id,
      initiatorListingId: listings[0]._id,
      responderListingId: listings[25]._id,
      message: 'Would you consider swapping the digital piano for my Samsung Galaxy S22 Ultra plus some cash?',
      status: 'Accepted',
      completedAt: new Date()
    });
    await exchange2.save();
    console.log('Created exchange proposals');

    // Create donation requests
    const donation1 = new DonationRequest({
      requesterId: users[2]._id,
      donorId: users[1]._id,
      listingId: listings[5]._id,
      message: 'I am a first-year engineering student and these textbooks would really help me. I cannot afford to buy new ones.',
      status: 'Approved',
      approvedAt: new Date()
    });
    await donation1.save();

    const donation2 = new DonationRequest({
      requesterId: users[7]._id,
      donorId: users[5]._id,
      listingId: listings[13]._id,
      message: 'My nieces are exactly this age group and would love these clothes. Thank you for your generosity!',
      status: 'Pending'
    });
    await donation2.save();

    const donation3 = new DonationRequest({
      requesterId: users[3]._id,
      donorId: users[8]._id,
      listingId: listings[26]._id,
      message: 'I run a small music school for underprivileged children. This harmonium would be invaluable for our students.',
      status: 'Pending'
    });
    await donation3.save();
    console.log('Created donation requests');

    // Create notifications
    const notifs = [
      { userId: users[0]._id, type: 'platform_update', title: 'Welcome to ReLoop!', message: 'Start listing items to make an environmental impact.', read: true },
      { userId: users[0]._id, type: 'listing_favorited', title: 'Item Favorited', message: 'Priya saved your listing "Sony WH-1000XM4 Wireless Headphones"', read: false },
      { userId: users[0]._id, type: 'new_message', title: 'New Message', message: 'You have a new message from Rahul about iPad Air 5th Generation', read: false },
      { userId: users[1]._id, type: 'donation_request', title: 'Donation Request', message: 'Rahul requested your donated item "Engineering Mathematics Reference Books Bundle"', read: true },
      { userId: users[1]._id, type: 'exchange_proposal', title: 'Exchange Proposal', message: 'Someone wants to exchange items with you!', read: false },
      { userId: users[4]._id, type: 'exchange_proposal', title: 'New Exchange Proposal', message: 'Priya wants to exchange Harry Potter books for your Yonex racket', read: false },
      { userId: users[5]._id, type: 'donation_request', title: 'Donation Request', message: 'Ananya requested kids clothing bundle', read: false },
      { userId: users[8]._id, type: 'donation_request', title: 'Donation Request', message: 'Sneha requested the Harmonium for her music school', read: false },
      { userId: users[0]._id, type: 'badge_earned', title: 'Badge Earned!', message: 'You earned the "Reuse Champion" badge for reusing 10+ items!', read: false },
      { userId: users[3]._id, type: 'milestone', title: 'Milestone Reached!', message: 'You have diverted over 100kg of waste from landfills. Amazing!', read: true },
    ];

    for (const notif of notifs) {
      await new Notification(notif).save();
    }
    console.log('Created notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('================================');
    console.log('Admin: arjun@example.com / Password123!');
    console.log('User:  priya@example.com / Password123!');
    console.log('User:  rahul@example.com / Password123!');
    console.log('All users share password: Password123!');
    console.log('================================\n');

    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
