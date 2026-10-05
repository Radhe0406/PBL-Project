// Sustainability impact calculations based on item category averages
// Sources: EPA waste reduction data, carbon footprint calculators

const CATEGORY_IMPACTS = {
  'Electronics & Gadgets': { wasteKg: 2.5, co2Kg: 15.0, waterL: 200 },
  'Books & Stationery': { wasteKg: 0.5, co2Kg: 2.5, waterL: 50 },
  'Furniture & Home Decor': { wasteKg: 15.0, co2Kg: 30.0, waterL: 500 },
  'Clothing & Accessories': { wasteKg: 1.0, co2Kg: 8.0, waterL: 2700 },
  'Sports & Outdoor': { wasteKg: 3.0, co2Kg: 10.0, waterL: 300 },
  'Bicycles & Vehicles': { wasteKg: 10.0, co2Kg: 50.0, waterL: 1000 },
  'Household Appliances': { wasteKg: 8.0, co2Kg: 25.0, waterL: 400 },
  'Toys & Gaming': { wasteKg: 1.5, co2Kg: 5.0, waterL: 150 },
  'Beauty & Personal Care': { wasteKg: 0.3, co2Kg: 1.5, waterL: 100 },
  'Musical Instruments': { wasteKg: 5.0, co2Kg: 12.0, waterL: 250 },
  'Other': { wasteKg: 2.0, co2Kg: 5.0, waterL: 200 }
};

const calculateItemImpact = (category) => {
  return CATEGORY_IMPACTS[category] || CATEGORY_IMPACTS['Other'];
};

const calculateUserPoints = (metrics) => {
  // Points formula: 10 per item + 1 per kg waste + 2 per kg CO2
  return Math.round(
    (metrics.itemsReused * 10) +
    (metrics.wasteDiverted * 1) +
    (metrics.co2Avoided * 2)
  );
};

const getAchievementBadges = (metrics) => {
  const badges = [];

  if (metrics.itemsReused >= 10) {
    badges.push({ id: 'reuse_champion', name: 'Reuse Champion', description: '10+ items reused', icon: '♻️', earned: true });
  }
  if (metrics.wasteDiverted >= 500) {
    badges.push({ id: 'eco_contributor', name: 'Eco Contributor', description: '500+ kg waste diverted', icon: '🌱', earned: true });
  }
  if (metrics.wasteDiverted >= 1000) {
    badges.push({ id: 'circular_hero', name: 'Circular Hero', description: '1000+ kg waste diverted', icon: '🌍', earned: true });
  }
  if (metrics.donationsMade >= 5) {
    badges.push({ id: 'community_helper', name: 'Community Helper', description: '5+ donations made', icon: '🤝', earned: true });
  }
  if (metrics.exchangesMade >= 10) {
    badges.push({ id: 'exchange_expert', name: 'Exchange Expert', description: '10+ successful exchanges', icon: '🔄', earned: true });
  }

  // Add unearned badges
  const allBadges = [
    { id: 'reuse_champion', name: 'Reuse Champion', description: '10+ items reused', icon: '♻️', threshold: { field: 'itemsReused', value: 10 } },
    { id: 'eco_contributor', name: 'Eco Contributor', description: '500+ kg waste diverted', icon: '🌱', threshold: { field: 'wasteDiverted', value: 500 } },
    { id: 'circular_hero', name: 'Circular Hero', description: '1000+ kg waste diverted', icon: '🌍', threshold: { field: 'wasteDiverted', value: 1000 } },
    { id: 'community_helper', name: 'Community Helper', description: '5+ donations made', icon: '🤝', threshold: { field: 'donationsMade', value: 5 } },
    { id: 'exchange_expert', name: 'Exchange Expert', description: '10+ successful exchanges', icon: '🔄', threshold: { field: 'exchangesMade', value: 10 } },
    { id: 'first_listing', name: 'First Step', description: 'Created your first listing', icon: '🎯', threshold: { field: 'itemsReused', value: 1 } },
    { id: 'green_starter', name: 'Green Starter', description: '100+ kg waste diverted', icon: '🌿', threshold: { field: 'wasteDiverted', value: 100 } }
  ];

  return allBadges.map(badge => ({
    ...badge,
    earned: badges.some(b => b.id === badge.id) ||
      (metrics[badge.threshold.field] >= badge.threshold.value)
  }));
};

const getContributionPercentile = (userMetrics, allUsersCount) => {
  // Simplified percentile calculation
  if (!allUsersCount || allUsersCount <= 1) return 100;
  const score = (userMetrics.itemsReused * 10) + (userMetrics.wasteDiverted * 2) + (userMetrics.co2Avoided * 3);
  if (score > 500) return 5;
  if (score > 200) return 10;
  if (score > 100) return 15;
  if (score > 50) return 25;
  if (score > 20) return 40;
  if (score > 10) return 50;
  return 75;
};

module.exports = {
  CATEGORY_IMPACTS,
  calculateItemImpact,
  calculateUserPoints,
  getAchievementBadges,
  getContributionPercentile
};
