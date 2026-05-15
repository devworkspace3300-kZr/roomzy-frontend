export const bookings = [
    { id: 'b1', hostelId: 'h1', hostelName: 'Al-Noor Boys Hostel', roomType: 'Double Sharing', checkIn: '2026-01-15', checkOut: '2026-06-15', status: 'active', amount: 8000, city: 'Peshawar' },
    { id: 'b2', hostelId: 'h3', hostelName: 'Mountain View Hostel', roomType: 'Double Sharing', checkIn: '2025-07-01', checkOut: '2025-12-31', status: 'completed', amount: 7500, city: 'Abbottabad' },
    { id: 'b3', hostelId: 'h2', hostelName: 'Scholars Residence', roomType: 'Single Room', checkIn: '2026-02-01', checkOut: '2026-07-01', status: 'pending', amount: 12000, city: 'Peshawar' },
];

export const savedListings = [
    { id: 'h2', name: 'Scholars Residence', city: 'Peshawar', price: 12000, rating: 4.8, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop' },
    { id: 'h4', name: 'City Center Girls Hostel', city: 'Peshawar', price: 15000, rating: 4.9, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' },
    { id: 'h7', name: 'Elite Student Suites', city: 'Abbottabad', price: 18000, rating: 4.7, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop' },
];

export const ownerListings = [
    { id: 'h1', name: 'Al-Noor Boys Hostel', city: 'Peshawar', status: 'active', rooms: 15, occupied: 12, rating: 4.5, earnings: 96000 },
    { id: 'h5', name: 'Budget Student Lodge', city: 'Peshawar', status: 'active', rooms: 20, occupied: 8, rating: 3.8, earnings: 36000 },
];

export const bookingRequests = [
    { id: 'br1', studentName: 'Ahmed Khan', hostelName: 'Al-Noor Boys Hostel', roomType: 'Double Sharing', requestDate: '2026-02-10', status: 'pending', phone: '+92-301-XXXXXXX' },
    { id: 'br2', studentName: 'Bilal Shah', hostelName: 'Al-Noor Boys Hostel', roomType: 'Single Room', requestDate: '2026-02-08', status: 'approved', phone: '+92-333-XXXXXXX' },
    { id: 'br3', studentName: 'Sara Ali', hostelName: 'Budget Student Lodge', roomType: 'Dormitory', requestDate: '2026-02-05', status: 'rejected', phone: '+92-312-XXXXXXX' },
];

export const earningsData = [
    { month: 'Sep', amount: 85000 },
    { month: 'Oct', amount: 92000 },
    { month: 'Nov', amount: 88000 },
    { month: 'Dec', amount: 96000 },
    { month: 'Jan', amount: 104000 },
    { month: 'Feb', amount: 110000 },
];

export const adminUsers = [
    { id: 'u1', name: 'Ahmed Khan', email: 'ahmed@test.com', role: 'student', status: 'active', joinDate: '2025-09-15' },
    { id: 'u2', name: 'Muhammad Noor', email: 'noor@test.com', role: 'owner', status: 'active', joinDate: '2024-06-20' },
    { id: 'u3', name: 'Sara Ali', email: 'sara@test.com', role: 'student', status: 'active', joinDate: '2025-11-01' },
    { id: 'u4', name: 'Fazal Khan', email: 'fazal@test.com', role: 'owner', status: 'pending', joinDate: '2026-01-10' },
    { id: 'u5', name: 'Bilal Shah', email: 'bilal@test.com', role: 'student', status: 'suspended', joinDate: '2025-04-05' },
];

export const verificationRequests = [
    { id: 'v1', hostelName: 'New Comfort Hostel', ownerName: 'Aslam Khan', city: 'Peshawar', requestDate: '2026-02-15', status: 'pending' },
    { id: 'v2', hostelName: 'Frontier Hostel', ownerName: 'Sajid Ali', city: 'Mardan', requestDate: '2026-02-12', status: 'pending' },
    { id: 'v3', hostelName: 'Hill View Lodge', ownerName: 'Nasir Baig', city: 'Abbottabad', requestDate: '2026-02-08', status: 'approved' },
];

export const analyticsData = {
    totalUsers: 2450,
    totalOwners: 85,
    totalHostels: 156,
    totalBookings: 890,
    monthlyGrowth: 12.5,
    activeListings: 142,
    pendingVerifications: 8,
    revenue: 5200000,
};
