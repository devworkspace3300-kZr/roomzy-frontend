import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiShield, FiCheckCircle, FiUsers, FiArrowRight, FiStar } from 'react-icons/fi';
import { HiCheckBadge } from 'react-icons/hi2';
import { CITIES, INSTITUTIONS, AMENITIES, ROOM_TYPES, PRICE_RANGES, HOW_IT_WORKS_STEPS, TESTIMONIALS, STATS, POPULAR_AREAS, UNIVERSITY_FEATURES, ROOMZY_SERVICES } from '../../constants';
import api from '../../api/axios';
import HostelCard from '../../components/ui/HostelCard';
import Button from '../../components/ui/Button';
import ScrollReveal from '../../components/shared/ScrollReveal';
import { HostelCardSkeleton } from '../../components/shared/SkeletonLoader';

export default function Home() {
    const [searchCity, setSearchCity] = useState('');
    const [searchInst, setSearchInst] = useState('');
    const [featuredHostels, setFeaturedHostels] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [dynamicInstitutions, setDynamicInstitutions] = useState([]);
    const [dynamicCities, setDynamicCities] = useState([]);
    const navigate = useNavigate();

    const [cityCounts, setCityCounts] = useState({});
    const [areaCounts, setAreaCounts] = useState({});

    useEffect(() => {
        // Fetch featured hostels
        api.get('/hostels')
            .then(res => {
                const hostels = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                const combined = [...hostels];
                setFeaturedHostels(combined.slice(0, 6));

                // Calculate counts for cities and areas
                const cCounts = {};
                const aCounts = {};
                combined.forEach(h => {
                    const c = h.city?.toLowerCase();
                    const a = h.area?.toLowerCase();
                    if (c) cCounts[c] = (cCounts[c] || 0) + 1;
                    if (a) aCounts[a] = (aCounts[a] || 0) + 1;
                });
                setCityCounts(cCounts);
                setAreaCounts(aCounts);
            })
            .catch(() => {
                setFeaturedHostels([]);
                setCityCounts({});
                setAreaCounts({});
            })
            .finally(() => setFeaturedLoading(false));

        // Fetch metadata same as Listings.jsx
        const fetchMetadata = async () => {
            try {
                const [instRes, hostRes] = await Promise.all([
                    api.get('/institutes'),
                    api.get('/hostels')
                ]);
                
                const instsRaw = instRes.data?.data || instRes.data || [];
                const hostelsRaw = hostRes.data?.data || hostRes.data || [];
                const allHostels = [...hostelsRaw];

                // Create cityId -> city name mapping from hostels
                const cityMap = {};
                allHostels.forEach(h => {
                    if (h.cityId && h.city) {
                        cityMap[String(h.cityId).toLowerCase()] = h.city;
                    }
                });

                // Merge with static institutions to ensure full coverage
                const mergedInsts = [...instsRaw];
                INSTITUTIONS.forEach(si => {
                    if (!mergedInsts.some(di => di.name.toLowerCase() === si.name.toLowerCase())) {
                        mergedInsts.push(si);
                    }
                });

                // Enrich institutes with city names for filtering
                const enrichedInsts = mergedInsts.map(i => ({
                    ...i,
                    city: i.city || i.cityName || cityMap[i.cityId?.toLowerCase()] || (CITIES.find(c => c.id === i.cityId)?.name) || ''
                }));
                
                setDynamicInstitutions(enrichedInsts);
                
                // Extract unique cities same as Listings.jsx
                const cityNames = [...new Set([
                    ...allHostels.map(h => h.city),
                    ...enrichedInsts.map(i => i.city)
                ])].filter(Boolean);
                
                const cities = cityNames.map(c => ({
                    id: c.toLowerCase(),
                    name: c
                }));
                setDynamicCities(cities.length > 0 ? cities : CITIES);
            } catch (error) {
                console.error('Failed to fetch hero metadata:', error);
            }
        };
        fetchMetadata();
    }, []);

    const handleSearch = (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        
        const params = new URLSearchParams();
        if (searchCity) params.set('city', searchCity);
        if (searchInst) params.set('institute', searchInst);
        
        const searchUrl = `/listings?${params.toString()}`;
        console.log('Searching with:', { city: searchCity, institute: searchInst, url: searchUrl });
        navigate(searchUrl);
    };

    return (
        <div>
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gray-900">
                {/* Background Image with Blur & Overlays */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522771731478-446370c02507?q=80&w=2070&auto=format&fit=crop"
                        alt="Students in Hostel"
                        className="w-full h-full object-cover filter blur-[3px] scale-105 opacity-60"
                        loading="eager"
                    />
                    {/* Stronger Gradient Overlays for Readability & Premium Dark Mode Feel */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/95" />
                    <div className="absolute inset-0 bg-primary-900/20 mix-blend-multiply" />

                    {/* Subtle Radial Glow behind text to provide depth */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/15 rounded-full blur-[100px] opacity-70 pointer-events-none" />
                </div>

                {/* Light Noise Texture overlay for a more tactile feel */}
                <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-28 w-full z-10 flex flex-col items-center mt-4 md:mt-8">
                    <div className="text-center max-w-4xl mx-auto w-full flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8 shadow-sm"
                        >
                            <span className="text-primary-100 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">
                                {/* Find Your Room. Own Your Journey. */}
                                Find, Book, and Stay with Confidence.
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-[800] text-white leading-[1.15] tracking-tight text-balance"
                        >
                            Discover Safe & <span className="text-primary-400">Verified</span> Student Accommodation
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                            className="text-base sm:text-lg lg:text-xl text-gray-300 mt-6 max-w-2xl mx-auto leading-relaxed font-medium"
                        >
                            Pakistan&apos;s trusted platform for safe, affordable, and verified student accommodation across KPK and beyond.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.form
                            initial={{ opacity: 0, y: 25, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                            onSubmit={handleSearch}
                            className="mt-10 w-full max-w-3xl mx-auto group"
                        >
                            <div className="bg-white/95 backdrop-blur-md rounded-[1.25rem] p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 flex flex-col sm:flex-row gap-2 transition-transform duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
                                <div className="flex-1 relative group bg-gray-50/50 hover:bg-white rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary-500 group-hover:scale-110 transition-transform pointer-events-none">
                                        <FiMapPin size={16} />
                                    </div>
                                    <select
                                        id="hero-city-select"
                                        value={searchCity}
                                        onChange={(e) => {
                                            setSearchCity(e.target.value);
                                            setSearchInst(''); // Reset institute on city change
                                        }}
                                        className="w-full pl-14 pr-4 py-3.5 bg-transparent text-gray-900 font-semibold text-sm border-none focus:outline-none focus:ring-0 focus:bg-white appearance-none cursor-pointer rounded-xl transition-all"
                                    >
                                        <option value="">City?</option>
                                        {((dynamicCities.length > 0 ? dynamicCities : CITIES)).map((city) => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="hidden sm:block w-[1px] bg-gray-200 my-2" />

                                <div className="flex-1 relative group bg-gray-50/50 hover:bg-white rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary-500 group-hover:scale-110 transition-transform pointer-events-none">
                                        <FiSearch size={16} />
                                    </div>
                                    <select
                                        id="hero-inst-select"
                                        value={searchInst}
                                        onChange={(e) => setSearchInst(e.target.value)}
                                        className="w-full pl-14 pr-4 py-3.5 bg-transparent text-gray-900 font-semibold text-sm border-none focus:outline-none focus:ring-0 focus:bg-white appearance-none cursor-pointer rounded-xl transition-all"
                                    >
                                        <option value="">Institute</option>
                                        {(dynamicInstitutions.length > 0 ? dynamicInstitutions : INSTITUTIONS)
                                            .filter(inst => {
                                                if (!searchCity) return true;
                                                const sCity = searchCity.toLowerCase().trim();
                                                const iCity = (inst.city || inst.cityName || inst.city_id || '').toLowerCase().trim();
                                                const iId = (inst.cityId || inst.city_id || '').toLowerCase().trim();
                                                
                                                // Loose match: check if city name matches OR if the city ID matches
                                                return iCity === sCity || iId === sCity || iCity.includes(sCity) || sCity.includes(iCity);
                                            })
                                            .map((inst) => (
                                                <option key={inst.id} value={inst.id}>
                                                    {inst.name} {inst.instituteType || inst.type ? `(${inst.instituteType || inst.type})` : ''}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <Button 
                                    type="submit"
                                    size="lg" 
                                    className="w-full sm:w-auto h-[52px] sm:px-10 rounded-xl shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all active:scale-95 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <FiSearch className="group-hover:rotate-12 transition-transform" />
                                        Search
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </Button>
                            </div>
                        </motion.form>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 border-t border-white/10 pt-8"
                        >
                            {STATS.map((stat) => (
                                <div key={stat.label} className="text-center flex flex-col items-center">
                                    <p className="text-3xl sm:text-4xl font-bold text-white drop-shadow-sm">{stat.value}</p>
                                    <p className="text-sm sm:text-base text-gray-400 font-medium mt-1 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Wave to transition smoothly to white sections below */}
                <div className="absolute bottom-0 left-0 right-0 z-10 w-full overflow-hidden leading-[0]">
                    <svg viewBox="0 0 1440 80" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-full relative block h-[60px] md:h-[80px]">
                        <path d="M0 40L48 37.3C96 34.7 192 29.3 288 32C384 34.7 480 45.3 576 48C672 50.7 768 45.3 864 40C960 34.7 1056 29.3 1152 29.3C1248 29.3 1344 34.7 1392 37.3L1440 40V80H0Z" />
                    </svg>
                </div>
            </section>

            {/* ===== POPULAR CITIES ===== */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Our Focus Areas</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Explore Abbottabad & Mansehra</h2>
                            <p className="text-text-muted mt-3 max-w-lg mx-auto">Find premium, verified student accommodations exclusively in Abbottabad and Mansehra.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {CITIES.map((city, i) => (
                            <ScrollReveal key={city.id} delay={i * 0.1}>
                                <Link
                                    to={`/listings?city=${city.id}`}
                                    className="group relative rounded-3xl overflow-hidden aspect-[4/3] block shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    <img
                                        src={city.image}
                                        alt={city.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                        <div>
                                            <h3 className="text-white font-bold text-2xl tracking-tight mb-1">{city.name}</h3>
                                            <p className="text-white/80 text-sm font-medium">{cityCounts[city.id] || 0} verified hostels</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-primary-500 transition-colors">
                                            <FiArrowRight size={20} />
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED HOSTELS ===== */}
            <section className="py-20 bg-surface-alt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Top Picks</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Featured Verified Hostels</h2>
                            <p className="text-text-muted mt-3 max-w-lg mx-auto">Hand-picked, verified accommodations trusted by students.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredLoading
                            ? Array.from({ length: 6 }).map((_, i) => <HostelCardSkeleton key={i} />)
                            : featuredHostels.length > 0
                                ? featuredHostels.map((hostel, i) => (
                                    <HostelCard key={hostel.id} hostel={hostel} index={i} />
                                ))
                                : <p className="col-span-3 text-center text-text-muted py-8">No verified hostels yet. Check back soon!</p>
                        }
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/listings" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-primary-200 text-primary-600 font-semibold text-sm hover:bg-primary-50 hover:border-primary-300 transition-all">
                            View All Hostels <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== POPULAR AREAS ===== */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Location Guide</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Popular Areas</h2>
                            <p className="text-text-muted mt-3 max-w-lg mx-auto">Explore student-friendly neighborhoods in Abbottabad & Mansehra.</p>
                        </div>
                    </ScrollReveal>

                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-6 gap-4 sm:gap-6 pb-6 scrollbar-hide px-4 -mx-4 snap-x">
                        {POPULAR_AREAS.map((area, i) => (
                            <ScrollReveal key={area.id} delay={i * 0.05} className="min-w-[200px] sm:min-w-[240px] lg:min-w-0 snap-start">
                                <Link
                                    to={`/listings?area=${area.id}`}
                                    className="group relative block rounded-3xl overflow-hidden aspect-square sm:aspect-[4/5] shadow-sm hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <img
                                        src={area.image}
                                        alt={area.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    {/* Premium gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end h-full">
                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-white font-bold text-base sm:text-lg tracking-tight mb-1">{area.name}</h3>
                                            <p className="text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">{area.city}</p>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold">
                                                    {areaCounts[area.name.toLowerCase()] || areaCounts[area.id] || 0} verified hostels
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Neighborhood Help CTA */}
                    <ScrollReveal>
                        <div className="mt-16 bg-gray-900 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden relative">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/5 rounded-full blur-[80px]" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                <div className="max-w-xl">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Need Help Finding the Right Area?</h3>
                                    <p className="text-gray-400 text-lg">
                                        Our local experts can help you choose the perfect neighborhood based on your institute, budget, and preferences.
                                    </p>
                                </div>
                                <Link to="/contact">
                                    <Button variant="white" size="lg" className="rounded-2xl px-10">
                                        Get Personalized Help
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ===== FIND NEAR UNIVERSITY ===== */}
            <section className="py-24 bg-surface-alt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Proximity Search</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Find Hostels Near Your Institute</h2>
                            <p className="text-text-muted mt-4 max-w-2xl mx-auto text-lg text-balance">
                                Discover accommodation options close to major educational institutions in Abbottabad & Mansehra.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-6 scrollbar-hide px-4 -mx-4 snap-x">
                        {UNIVERSITY_FEATURES.map((uni, i) => (
                            <ScrollReveal key={uni.id} delay={i * 0.1} className="min-w-[260px] sm:min-w-[300px] lg:min-w-0 snap-start">
                                <Link to={`/listings?institute=${uni.id}`} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all block h-full">
                                    <div className="aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <img 
                                            src={uni.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80'} 
                                            alt={uni.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-text-primary group-hover:text-primary-600 transition-colors uppercase text-xs tracking-wider line-clamp-1">{uni.name}</h3>
                                            <span className="text-[9px] font-bold text-text-muted">{uni.location || uni.city}</span>
                                        </div>
                                        <p className="text-[10px] text-text-muted font-medium mb-3">{uni.desc || `Verified accommodation near ${uni.shortName || 'campus'}`}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center">
                                                <FiUsers size={10} className="text-primary-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-primary-700">{uni.students || '1000+ Students'}</span>
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Simple Process</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">How Roomzy Works</h2>
                            <p className="text-text-muted mt-3 max-w-lg mx-auto">Three easy steps to find your perfect student accommodation.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {HOW_IT_WORKS_STEPS.map((step, i) => {
                            const icons = [FiSearch, FiCheckCircle, FiShield];
                            const Icon = icons[i];
                            return (
                                <ScrollReveal key={step.step} delay={i * 0.15}>
                                    <div className="relative text-center group">
                                        {i < 2 && (
                                            <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200" />
                                        )}
                                        <div className="relative inline-flex">
                                            <div className="w-24 h-24 rounded-3xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                                                <Icon size={36} className="text-primary-500" />
                                            </div>
                                            <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                {step.step}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary mt-6 mb-3">{step.title}</h3>
                                        <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== OUR SERVICES (PAYFAST REQUIREMENT) ===== */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Platform Features</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Our Core Services</h2>
                            <p className="text-text-muted mt-3 max-w-lg mx-auto">Everything you need for a seamless student housing experience.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ROOMZY_SERVICES.map((service, i) => (
                            <ScrollReveal key={service.id} delay={i * 0.05}>
                                <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-card-hover transition-all h-full flex flex-col">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 text-primary-500">
                                        {i === 0 && <FiShield size={22} />}
                                        {i === 1 && <FiCheckCircle size={22} />}
                                        {i === 2 && <FiSearch size={22} />}
                                        {i === 3 && <FiUsers size={22} />}
                                        {i > 3 && <HiCheckBadge size={22} />}
                                    </div>
                                    <h3 className="font-bold text-text-primary mb-2 tracking-tight">{service.title}</h3>
                                    <p className="text-sm text-text-muted leading-relaxed flex-1">{service.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TRUST & SAFETY ===== */}
            <section className="py-20 bg-surface-alt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal direction="left">
                            <div>
                                <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Why Roomzy?</p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
                                    Your Safety is Our <span className="gradient-text">Priority</span>
                                </h2>
                                <p className="text-text-muted leading-relaxed mb-8">
                                    We personally visit and verify every hostel on our platform. Unlike other marketplaces, every listing on Roomzy is physically inspected for safety, cleanliness, and quality before going live.
                                </p>
                                <div className="space-y-5">
                                    {[
                                        { icon: HiCheckBadge, title: 'Verified Listings', desc: 'Every hostel is physically inspected by our team before listing.' },
                                        { icon: FiShield, title: 'Student Safety First', desc: 'CCTV, emergency contacts, and safety standards are mandatory.' },
                                        { icon: FiUsers, title: 'Real Reviews', desc: 'Only verified students who stayed can leave reviews.' },
                                        { icon: FiStar, title: 'Quality Guaranteed', desc: 'We maintain strict quality standards and remove underperforming hostels.' },
                                    ].map(({ icon: Icon, title, desc }) => (
                                        <div key={title} className="flex gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                                                <Icon size={20} className="text-primary-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-text-primary">{title}</h4>
                                                <p className="text-sm text-text-muted mt-0.5">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <div className="relative">
                                <div className="rounded-3xl overflow-hidden shadow-card-hover">
                                    <img
                                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop"
                                        alt="Clean Verified Hostel Room"
                                        className="w-full h-[400px] object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Floating card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-card-hover border border-border-light"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                                            <HiCheckBadge size={22} className="text-accent-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">150+ Verified</p>
                                            <p className="text-xs text-text-muted">Hostels & counting</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2">Student Stories</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">What Students Say</h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <ScrollReveal key={t.id} delay={i * 0.1}>
                                <div className="bg-white rounded-2xl p-6 shadow-card border border-border-light hover:shadow-card-hover transition-shadow h-full flex flex-col">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <FiStar
                                                key={s}
                                                size={14}
                                                className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                                    <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border-light">
                                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">{t.name}</p>
                                            <p className="text-xs text-text-muted">{t.university}</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="relative rounded-3xl overflow-hidden gradient-hero p-12 sm:p-16 text-center">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Room?</h2>
                                <p className="text-primary-100/80 max-w-xl mx-auto mb-8">
                                    Join thousands of students across KPK who found their ideal accommodation through Roomzy.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/listings">
                                        <Button variant="white" size="lg">
                                            Browse Hostels <FiArrowRight />
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button variant="ghost" size="lg" className="text-white border-2 border-white/30 hover:bg-white/10 hover:text-white">
                                            List Your Hostel
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
