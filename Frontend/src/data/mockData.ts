export const dashboardStats = [
  { label: "Total Donations", value: "12,480 kg", icon: "Package", change: "+12.5%", positive: true },
  { label: "Active Matches", value: "142", icon: "Handshake", change: "+8.2%", positive: true },
  { label: "Avg. Pickup Time", value: "42 mins", icon: "Clock", change: "-4.1%", positive: true },
  { label: "CO2 Offset", value: "3.8 Tons", icon: "Leaf", change: "+18%", positive: true },
];

export const donations = [
  { id: 1, name: "Fresh Bakery Items", quantity: "25 units", source: "Greenwich Bakery", urgency: "urgent", image: "bakery", preparedAt: "8:00 AM", expiresAt: "6:00 PM" },
  { id: 2, name: "Organic Produce Box", quantity: "15kg", source: "Whole Foods Market", urgency: "moderate", image: "produce", preparedAt: "7:00 AM", expiresAt: "Tomorrow" },
  { id: 3, name: "Dairy Essentials", quantity: "10 cartons", source: "City Dairy Co.", urgency: "low", image: "dairy", preparedAt: "6:00 AM", expiresAt: "3 Days" },
  { id: 4, name: "Mixed Deli Trays", quantity: "8 trays", source: "Downtown Deli", urgency: "urgent", image: "deli", preparedAt: "11:00 AM", expiresAt: "8:00 PM" },
  { id: 5, name: "Bulk Grains", quantity: "50kg", source: "Central Silo", urgency: "low", image: "grains", preparedAt: "Yesterday", expiresAt: "2 Weeks" },
  { id: 6, name: "Prepared Meals", quantity: "20 meals", source: "Kitchen Collective", urgency: "moderate", image: "meals", preparedAt: "10:00 AM", expiresAt: "Tonight" },
];

export const matches = [
  { id: 1, ngo: "Metropolis Community Kitchen", distance: "0.8 miles", capacity: "High (85%)", trustScore: 4.9, matchScore: 98, area: "Downtown Hub", pickupTime: "15-20 min", rank: "Top 1%" },
  { id: 2, ngo: "St. Jude's Hope Shelter", distance: "1.2 miles", capacity: "Medium", trustScore: 4.7, matchScore: 90, area: "Midtown", pickupTime: "20-25 min", rank: "Top 5%" },
  { id: 3, ngo: "Green Earth Pantry", distance: "2.4 miles", capacity: "High Volume", trustScore: 4.5, matchScore: 85, area: "East Side", pickupTime: "25-30 min", rank: "Top 10%" },
  { id: 4, ngo: "ElderCare Nutrition Hub", distance: "3.1 miles", capacity: "Specific Needs", trustScore: 4.3, matchScore: 75, area: "North Quarter", pickupTime: "30-35 min", rank: "Top 15%" },
];

export const deliveryTimeline = [
  { step: "Reported", time: "10:00 AM", completed: true, icon: "Megaphone" },
  { step: "Matched", time: "10:15 AM", completed: true, icon: "Handshake" },
  { step: "Accepted", time: "10:30 AM", completed: true, icon: "CheckCircle" },
  { step: "Picked Up", time: "11:00 AM", completed: true, icon: "Package" },
  { step: "In Transit", time: "ETA: 11:45 AM", completed: false, active: true, icon: "Truck" },
];

export const impactStats = [
  { label: "MEALS SERVED", value: "1.24M", change: "+12%", icon: "Utensils" },
  { label: "CO2 PREVENTED", value: "450 Tons", change: "+8.4%", icon: "CloudOff" },
  { label: "FOOD DIVERTED", value: "892 Tons", change: "+15%", icon: "Recycle" },
];

export const chartData = [
  { month: "Jan", actual: 45000, predicted: 42000 },
  { month: "Feb", actual: 52000, predicted: 50000 },
  { month: "Mar", actual: 61000, predicted: 58000 },
  { month: "Apr", actual: 75000, predicted: 70000 },
  { month: "May", actual: 88000, predicted: 85000 },
  { month: "Jun", actual: 95000, predicted: 92000 },
  { month: "Jul", actual: 102000, predicted: 98000 },
  { month: "Aug", actual: 108000, predicted: 105000 },
  { month: "Sep", actual: 112000, predicted: 110000 },
  { month: "Oct", actual: 118000, predicted: 115000 },
  { month: "Nov", actual: 122000, predicted: 120000 },
  { month: "Dec", actual: 125000, predicted: 123000 },
];

export const activityFeed = [
  { type: "match", title: "New AI Match", time: "2 mins ago", description: "Whole Foods Market donation matched with City Food Bank (98% confidence).", color: "primary" },
  { type: "acceptance", title: "NGO Acceptance", time: "15 mins ago", description: "Safe Haven Shelter accepted the dairy surplus from Starbucks #129.", color: "info" },
  { type: "logistics", title: "Logistics Dispatched", time: "45 mins ago", description: "Driver Mark R. has started the route for the Downtown Collection.", color: "muted" },
];

export const organizationProfile = {
  name: "Global Food Rescue NGO",
  verified: true,
  location: "Seattle, WA",
  joinedDate: "Oct 2023",
  email: "partnerships@globalfoodrescue.com",
  phone: "+1 (206) 555-0123",
  address: "1234 Emerald Way, Suite 400, Seattle, WA 98101",
  hours: "Mon-Sat, 08:00 - 20:00",
  capacity: "2 - 5 tons",
  trustScore: 4.9,
  reviewCount: 128,
  ratings: { 5: 90, 4: 7, 3: 3 },
  storage: ["Cold Storage", "Dry Goods"],
  achievements: [
    { name: "Zero Waste Hero", desc: "Saved 10k tons", icon: "Award" },
    { name: "Top Donor 2023", desc: "High Volume", icon: "Trophy" },
    { name: "Rapid Responder", desc: "Quick Pickups", icon: "Zap" },
    { name: "Community Pillar", desc: "100+ Network", icon: "Users" },
  ],
  totalMeals: "1.2M+",
  wasteRedirected: "450 Tons",
  activePartners: "84",
  latitude: 47.6062,
  longitude: -122.3321,
};

export const mapMarkers = [
  { id: 1, type: "donation", name: "Artisan Bakery", lat: 35, lng: 45, status: "pending" },
  { id: 2, type: "ngo", name: "St. Mary's Shelter", lat: 55, lng: 65, status: "active" },
  { id: 3, type: "truck", name: "Truck #402", lat: 40, lng: 50, status: "transit", pickup: "Artisan Bakery", destination: "St. Mary's Shelter", progress: 65 },
  { id: 4, type: "donation", name: "Metro Grocery", lat: 70, lng: 30, status: "pending" },
  { id: 5, type: "ngo", name: "Hope Community", lat: 25, lng: 70, status: "active" },
  { id: 6, type: "truck", name: "Truck #718", lat: 50, lng: 40, status: "transit", pickup: "Metro Grocery", destination: "Hope Community", progress: 30 },
];

export const communityStories = [
  { category: "COMMUNITY", readTime: "5 MIN READ", title: "How local kitchens are scaling fresh nutrition", excerpt: "Before SurplusSync, we were struggling to provide fresh produce. Now, our community..." },
  { category: "ENVIRONMENT", readTime: "3 MIN READ", title: "Zero-waste grocery initiative saves 12 tons", excerpt: "Pike Street Market rescued nearly 12 tons of organic produce last month alone through ou..." },
  { category: "INNOVATION", readTime: "8 MIN READ", title: "The logistics of hope: AI in redistribution", excerpt: "Exploring the complex algorithms that match surplus food with hungry populations in unde..." },
];
