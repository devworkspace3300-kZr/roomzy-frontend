import hazaraImg from '../assets/hazara.webp';
import complexImg from '../assets/complex.png';
import abbottabadImg from '../assets/abbottabad.jpg';
import ghazikotImg from '../assets/ghazikot.webp';
import mandianImg from '../assets/mandian.jfif';
import shinkiariImg from '../assets/shinkiari.jfif';
import abbottabadTopImg from '../assets/abbottabadintopsection.jpg';
import mansehraImg from '../assets/mansehra.jpg';
import comsatsImg from '../assets/Comsats_Abbottabad.jpg';

export const CITIES = [
    { id: 'abbottabad', name: 'Abbottabad', province: 'KPK', image: abbottabadTopImg, hostelCount: 45 },
    { id: 'mansehra', name: 'Mansehra', province: 'KPK', image: mansehraImg, hostelCount: 32 },
];

export const INSTITUTIONS = [
    // Abbottabad Main Institutes
    { id: 'comsats-abbottabad', name: 'COMSATS Abbottabad', city: 'abbottabad', type: 'University', shortName: 'COMSATS' },
    { id: 'aust', name: 'AUST Abbottabad', city: 'abbottabad', type: 'University', shortName: 'AUST' },
    { id: 'amc', name: 'Ayub Medical College (AMC)', city: 'abbottabad', type: 'Medical College', shortName: 'AMC' },
    { id: 'wmc', name: 'Women Medical College', city: 'abbottabad', type: 'Medical College', shortName: 'WMC' },
    { id: 'wims', name: 'Women Institute of Learning (WIMS)', city: 'abbottabad', type: 'University', shortName: 'WIMS' },
    { id: 'ath', name: 'Ayub Teaching Hospital', city: 'abbottabad', type: 'Landmark', shortName: 'ATH' },
    { id: 'frontiers-medical', name: 'Frontiers Medical College', city: 'abbottabad', type: 'Medical College', shortName: 'FMC' },
    { id: 'gpgc-abbottabad', name: 'Govt. Post Graduate College No. 1', city: 'abbottabad', type: 'College', shortName: 'GPGC' },
    { id: 'peace-abbottabad', name: 'Peace Group of Schools & Colleges', city: 'abbottabad', type: 'College', shortName: 'Peace' },
    { id: 'burn-hall', name: 'Army Burn Hall College', city: 'abbottabad', type: 'College', shortName: 'Burn Hall' },

    // Mansehra Main Institutes
    { id: 'hazara', name: 'Hazara University', city: 'mansehra', type: 'University', shortName: 'HU' },
    { id: 'mansehra-university', name: 'University of Mansehra', city: 'mansehra', type: 'University', shortName: 'UoM' },
    { id: 'paf-iast', name: 'PAF-IAST', city: 'mansehra', type: 'University', shortName: 'PAF-IAST' },
    { id: 'pmm', name: 'Poonch Medical College (Mansehra)', city: 'mansehra', type: 'University', shortName: 'PMC' },
    { id: 'gpgc-mansehra', name: 'Govt. Post Graduate College', city: 'mansehra', type: 'College', shortName: 'GPGC' },
    { id: 'peace-mansehra', name: 'Peace Group of Schools & Colleges', city: 'mansehra', type: 'College', shortName: 'Peace' },
    { id: 'mansehra-public', name: 'Mansehra Public School & College', city: 'mansehra', type: 'College', shortName: 'MPS' },
];

export const AMENITIES = [
    'WiFi', 'AC', 'Parking', 'Laundry', 'Mess/Food', 'CCTV',
    'Generator', 'Water Cooler', 'Study Room', 'Common Area',
    'Kitchen', 'Gym', 'Geyser', 'UPS', 'Filtered Water',
];

export const ROOM_TYPES = [
    { id: 'single', name: 'Single Room' },
    { id: 'double', name: 'Double Sharing' },
    { id: 'triple', name: 'Triple Sharing' },
    { id: 'dormitory', name: 'Dormitory' },
];

export const PRICE_RANGES = [
    { id: '0-5000', label: 'Under ₨5,000', min: 0, max: 5000 },
    { id: '5000-10000', label: '₨5,000 – ₨10,000', min: 5000, max: 10000 },
    { id: '10000-15000', label: '₨10,000 – ₨15,000', min: 10000, max: 15000 },
    { id: '15000-25000', label: '₨15,000 – ₨25,000', min: 15000, max: 25000 },
    { id: '25000+', label: 'Above ₨25,000', min: 25000, max: 999999 },
];

export const HOW_IT_WORKS_STEPS = [
    {
        step: 1,
        title: 'Search Your Area',
        description: 'Enter your institute, city, or landmark to find nearby verified student accommodations.',
        icon: 'search',
    },
    {
        step: 2,
        title: 'Compare & Choose',
        description: 'Browse detailed listings with photos, amenities, reviews, and transparent pricing.',
        icon: 'compare',
    },
    {
        step: 3,
        title: 'Book With Confidence',
        description: 'Book your verified room securely. Every listing is personally verified by our team.',
        icon: 'book',
    },
];

export const TESTIMONIALS = [
    {
        id: 1,
        name: 'Ahmed Khan',
        university: 'Hazara University',
        text: 'Roomzy made finding a hostel near HU so easy! The verified badge gave me confidence, and the room was exactly as shown. Highly recommend!',
        rating: 5,
        avatar: 'AK',
    },
    {
        id: 2,
        name: 'Sara Ali',
        university: 'COMSATS Abbottabad',
        text: 'As a female student, safety was my priority. Roomzy\'s verified listings and reviews helped me find the perfect place near campus.',
        rating: 5,
        avatar: 'SA',
    },
    {
        id: 3,
        name: 'Usman Shah',
        university: 'AUST Abbottabad',
        text: 'The filtering by university feature is genius! Found an affordable double-sharing room within 5 minutes of searching. Great platform!',
        rating: 4,
        avatar: 'US',
    },
    {
        id: 4,
        name: 'Fatima Noor',
        university: 'Ayub Medical College',
        text: 'I was struggling to find a hostel when I got transferred to AMC. Roomzy connected me with a great place within a day. Amazing experience!',
        rating: 5,
        avatar: 'FN',
    },
];

export const FAQ_DATA = [
    {
        question: 'What is Roomzy?',
        answer: "Roomzy is Pakistan's trusted platform for finding verified student hostels and accommodations near educational institutes. We personally verify every listing to ensure safety, quality, and transparency.",
    },
    {
        question: 'How does verification work?',
        answer: 'Our team physically visits and inspects every hostel before listing it on the platform. We check safety standards, amenities, cleanliness, and living conditions. Verified hostels get our trusted badge.',
    },
    {
        question: 'Is Roomzy free for students?',
        answer: 'Yes! Searching, browsing, and booking on Roomzy is completely free for students. We charge a small commission to hostel owners, not students.',
    },
    {
        question: 'Which cities does Roomzy cover?',
        answer: 'We currently cover Abbottabad and Mansehra in KPK, with plans to rapidly expand to other major student hubs!',
    },
    {
        question: 'Can I list my hostel on Roomzy?',
        answer: 'Absolutely! If you own a student hostel or have rooms available, you can sign up as an owner and list your property. Our team will verify your listing before it goes live.',
    },
    {
        question: 'How do I book a room?',
        answer: "Simply search for hostels near your institute, browse the listings, check reviews and amenities, and click 'Book Now'. You'll receive confirmation from the owner within 24 hours.",
    },
    {
        question: 'What if I have an issue with my hostel?',
        answer: "Roomzy has a dedicated support team. If you face any issues, you can reach out to us through the Contact page or email support@roomzy.pk. We'll mediate and help resolve your concern.",
    },
    {
        question: 'Are female hostels available?',
        answer: 'Yes! We have dedicated female hostel listings with enhanced safety features. You can filter specifically for female hostels in the search.',
    },
];

export const STATS = [
    { label: 'Verified Hostels', value: '3+' },
    { label: 'Happy Students', value: '1,200+' },
    { label: 'Cities', value: '2' },
    { label: 'Institutes Covered', value: '25+' },
];

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
];

export const POPULAR_AREAS = [
    {
        id: 'mandian',
        name: 'Mandian',
        city: 'Abbottabad',
        tag: 'Medical Hub',
        description: 'Near Ayub Medical College and Women Medical College. Excellent medical and transport facilities.',
        highlight: 'Ideal for Medical Students',
        hostelCount: 2,
        image: mandianImg,
    },
    {
        id: 'ghazikot',
        name: 'Ghazikot',
        city: 'Mansehra',
        tag: 'Premium Area',
        description: 'A premium, high-security residential area in Mansehra with modern facilities and peaceful environment.',
        highlight: 'Safe & Premium Living',
        hostelCount: 1,
        image: ghazikotImg,
    },
    {
        id: 'supply',
        name: 'Supply',
        city: 'Abbottabad',
        tag: 'Central',
        description: 'Vibrant heart of Abbottabad with easy access to shopping, food, and COMSATS University.',
        highlight: 'Central & Convenient',
        hostelCount: 4,
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    },
    {
        id: 'kaghan-colony',
        name: 'Kaghan Colony',
        city: 'Abbottabad',
        tag: 'Residential',
        description: 'Peaceful residential area popular among students for its quiet environment.',
        highlight: 'Quiet & Peaceful',
        hostelCount: 3,
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
    },
    {
        id: 'bilal-town',
        name: 'Bilal Town',
        city: 'Abbottabad',
        tag: 'Modern',
        description: 'Modern neighborhood with new constructions and good facilities.',
        highlight: 'Modern Infrastructure',
        hostelCount: 2,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    },
    {
        id: 'dhodial',
        name: 'Dhodial',
        city: 'Mansehra',
        tag: 'Academic Hub',
        description: 'The academic heart of Mansehra, home to Hazara University. Very peaceful and student-friendly.',
        highlight: 'Beside Hazara University',
        hostelCount: 15,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=800&q=80',
    },
    {
        id: 'kakul-road',
        name: 'Kakul Road',
        city: 'Abbottabad',
        tag: 'Military Area',
        description: 'Prestigious and secure area near the Pakistan Military Academy. High-quality living standards.',
        highlight: 'Safe & Secure',
        hostelCount: 5,
        image: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: 'kkh-mansehra',
        name: 'KKH Road',
        city: 'Mansehra',
        tag: 'Main Corridor',
        description: 'Strategic location along the Silk Road with excellent transport links across the city.',
        highlight: 'Transport Hub',
        hostelCount: 8,
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop',
    },
    {
        id: 'shinkiari-road',
        name: 'Shinkiari Road',
        city: 'Mansehra',
        tag: 'Academic',
        description: 'Key academic corridor in Mansehra, close to Hazara University and major educational institutes.',
        highlight: 'Institute Proximity',
        hostelCount: 4,
        image: shinkiariImg,
    },
    {
        id: 'city-center-mansehra',
        name: 'City Center',
        city: 'Mansehra',
        tag: 'Commercial',
        description: 'Busy commercial area with everything within walking distance.',
        highlight: 'Everything Nearby',
        hostelCount: 5,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
    },
    {
        id: 'jinnahabad',
        name: 'Jinnahabad',
        city: 'Abbottabad',
        tag: 'Budget',
        description: 'Affordable residential area with plenty of options for students looking for value and peace.',
        highlight: 'Budget-Friendly',
        hostelCount: 2,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    },
    {
        id: 'cantt-lari',
        name: 'Cantt / Lari Adda',
        city: 'Atd/Mansehra',
        tag: 'Accessibility',
        description: 'Central transport hubs in both cities offering unmatched connectivity to all institutes.',
        highlight: 'Perfect Connectivity',
        hostelCount: 3,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    }
];

export const UNIVERSITY_FEATURES = [
    {
        id: 'aust',
        name: 'Abbottabad University of Science & Technology',
        location: 'Abbottabad',
        desc: 'Verified accommodation near AUST',
        students: '1000+ Students',
        image: abbottabadImg
    },
    {
        id: 'amc',
        name: 'Ayub Medical College',
        location: 'Abbottabad',
        desc: 'Verified accommodation near AMC',
        students: '1000+ Students',
        image: complexImg
    },
    {
        id: 'comsats-abbottabad',
        name: 'COMSATS University Islamabad',
        location: 'Abbottabad',
        desc: 'Verified accommodation near COMSATS',
        students: '1000+ Students',
        image: comsatsImg
    },
    {
        id: 'hazara',
        name: 'Hazara University',
        location: 'Mansehra',
        desc: 'Verified accommodation near HU',
        students: '1000+ Students',
        image: hazaraImg
    }
];

// export const STATIC_HOSTELS = [
//     {
//         id: 'static-1',
//         name: 'Al-Madina Executive Hostel',
//         city: 'Abbottabad',
//         area: 'Mandian',
//         fullAddress: 'Near Ayub Medical College, Mandian, Abbottabad',
//         genderType: 'male',
//         startingPrice: 8500,
//         averageRating: 4.8,
//         totalReviews: 12,
//         images: [{ imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' }],
//         amenities: [{ name: 'WiFi', slug: 'wifi' }, { name: 'Generator', slug: 'generator' }, { name: 'Mess', slug: 'meals' }],
//         nearestInstituteId: 'amc'
//     },
//     {
//         id: 'static-2',
//         name: 'Safe Haven Girls Hostel',
//         city: 'Abbottabad',
//         area: 'Supply',
//         fullAddress: 'Opposite COMSATS University, Supply, Abbottabad',
//         genderType: 'female',
//         startingPrice: 12000,
//         averageRating: 4.9,
//         totalReviews: 24,
//         images: [{ imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80' }],
//         amenities: [{ name: 'WiFi', slug: 'wifi' }, { name: 'AC', slug: 'ac' }, { name: 'Security', slug: 'security' }],
//         nearestInstituteId: 'comsats-abbottabad'
//     },
//     {
//         id: 'static-3',
//         name: 'Hazara Student Palace',
//         city: 'Mansehra',
//         area: 'Dhodial',
//         fullAddress: 'Main Gate, Hazara University, Dhodial, Mansehra',
//         genderType: 'male',
//         startingPrice: 7500,
//         averageRating: 4.5,
//         totalReviews: 8,
//         images: [{ imageUrl: 'https://images.unsplash.com/photo-1522771739844-649fb4afd0ff?w=800&q=80' }],
//         amenities: [{ name: 'WiFi', slug: 'wifi' }, { name: 'Parking', slug: 'parking' }],
//         nearestInstituteId: 'hazara'
//     },
//     {
//         id: 'static-4',
//         name: 'Mansehra Executive Residency',
//         city: 'Mansehra',
//         area: 'Ghazikot',
//         fullAddress: 'Sector A, Ghazikot Township, Mansehra',
//         genderType: 'male',
//         startingPrice: 15000,
//         averageRating: 5.0,
//         totalReviews: 5,
//         images: [{ imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80' }],
//         amenities: [{ name: 'WiFi', slug: 'wifi' }, { name: 'AC', slug: 'ac' }, { name: 'Generator', slug: 'generator' }],
//         nearestInstituteId: 'mansehra-university'
//     }
// ];

export const ROOMZY_SERVICES = [
    { id: 1, title: 'Verified Accommodation', desc: 'Secure and physically inspected hostels for students.', icon: 'shield' },
    { id: 2, title: 'Online Rent Payments', desc: 'Pay rent securely online via PayFast payment gateway.', icon: 'credit-card' },
    { id: 3, title: 'Automated Room Booking', desc: 'Real-time room availability and instant booking system.', icon: 'calendar' },
    { id: 4, title: 'Warden Support System', desc: 'Direct in-app messaging and support with hostel wardens.', icon: 'message-circle' },
    { id: 5, title: 'Digital Tenancy Management', desc: 'Manage your active stay, invoices, and move-out process.', icon: 'file-text' },
    { id: 6, title: 'Owner Dashboard', desc: 'Comprehensive property and room management for hostel owners.', icon: 'home' },
    { id: 7, title: 'Maintenance Requests', desc: 'Log, track, and resolve facility maintenance issues easily.', icon: 'tool' },
    { id: 8, title: 'Student Safety Portal', desc: 'Emergency contacts and verified student identity management.', icon: 'users' },
];
