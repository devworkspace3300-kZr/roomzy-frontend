import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import { CITIES, AMENITIES, ROOM_TYPES, PRICE_RANGES, POPULAR_AREAS, INSTITUTIONS, UNIVERSITY_FEATURES } from '../../constants';
import api from '../../api/axios';
import HostelCard from '../../components/ui/HostelCard';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/shared/EmptyState';
import { HostelCardSkeleton } from '../../components/shared/SkeletonLoader';

export default function Listings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hostelsData, setHostelsData] = useState([]);
    const itemsPerPage = 9;
    const [dynamicInstitutions, setDynamicInstitutions] = useState([]);
    const [dynamicAmenities, setDynamicAmenities] = useState([]);
    const [dynamicCities, setDynamicCities] = useState([]);
    const [dynamicAreas, setDynamicAreas] = useState([]);

    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        area: searchParams.get('area') || '',
        institute: searchParams.get('institute') || searchParams.get('university') || '',
        genderType: searchParams.get('genderType') || '',
        roomType: searchParams.get('roomType') || '',
        priceRange: '',
        amenities: [],
        sortBy: 'newest',
    });

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [instRes, amRes, hostRes] = await Promise.all([
                api.get('/institutes'),
                api.get('/amenities'),
                api.get('/hostels')
            ]);
            
            const instsRaw = instRes.data?.data || instRes.data || [];
            const amenities = amRes.data?.data || amRes.data || [];
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
                if (!mergedInsts.some(di => di.name?.toLowerCase() === si.name?.toLowerCase())) {
                    mergedInsts.push(si);
                }
            });

            // Enrich institutes with city names for filtering
            setDynamicInstitutions(INSTITUTIONS);
            setDynamicAmenities(amenities);
            
            setDynamicCities(CITIES);

            // Extract unique areas from all hostels
            const areas = [...new Set(allHostels.map(h => `${h.area}|${h.city}`).filter(Boolean))].map(areaCityStr => {
                const [a, c] = areaCityStr.split('|');
                return {
                    id: a.toLowerCase(),
                    name: a,
                    city: c
                };
            });
            setDynamicAreas(areas);
        } catch (error) {
            console.error('Failed to fetch filter metadata:', error);
        }
    };



    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            city: searchParams.get('city') || '',
            area: searchParams.get('area') || '',
            institute: searchParams.get('institute') || searchParams.get('university') || '',
            genderType: searchParams.get('genderType') || '',
            roomType: searchParams.get('roomType') || '',
        }));
    }, [searchParams]);

    useEffect(() => {
        fetchHostels();
    }, [filters]);

    const fetchHostels = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.area) params.append('area', filters.area);
            if (filters.institute) params.append('institute', filters.institute);
            if (filters.genderType) params.append('genderType', filters.genderType);
            if (filters.roomType) params.append('roomType', filters.roomType);
            if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
            if (filters.priceRange) {
                const range = PRICE_RANGES.find(r => r.id === filters.priceRange);
                if (range) {
                    if (range.min) params.append('minPrice', range.min);
                    if (range.max) params.append('maxPrice', range.max);
                }
            }
            const response = await api.get(`/hostels?${params.toString()}`);
            const apiData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            
            let data = [...apiData];
            
            // Client-side sort
            if (filters.sortBy === 'price_low') data = [...data].sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
            else if (filters.sortBy === 'price_high') data = [...data].sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
            setHostelsData(data);
        } catch (error) {
            console.error('Failed to fetch hostels:', error);
            setHostelsData([]);
        } finally {
            setLoading(false);
        }
    };

    const paginatedHostels = hostelsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(hostelsData.length / itemsPerPage);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const toggleAmenity = (amenity) => {
        setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ 
            city: '', 
            area: '', 
            institute: '', 
            genderType: '', 
            roomType: '',
            priceRange: '', 
            amenities: [], 
            sortBy: 'newest' 
        });
        setSearchParams({});
        setCurrentPage(1);
    };

    const activeFilterCount = [
        filters.city, 
        filters.area, 
        filters.institute, 
        filters.genderType, 
        filters.roomType,
        filters.priceRange
    ].filter(Boolean).length + filters.amenities.length;

    const FilterSidebar = () => (
        <div className="space-y-8">
            {/* City */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">City</label>
                <select 
                    value={filters.city} 
                    onChange={(e) => updateFilter('city', e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 shadow-sm appearance-none transition-all cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                    <option value="">All Cities</option>
                    {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Area */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Area</label>
                <select 
                    value={filters.area} 
                    onChange={(e) => updateFilter('area', e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 shadow-sm appearance-none transition-all cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                    <option value="">All Areas</option>
                    {(dynamicAreas.length > 0 ? dynamicAreas : POPULAR_AREAS)
                        .filter(a => {
                            if (!filters.city) return true;
                            const cityMatch = a?.city?.toLowerCase() === filters.city?.toLowerCase();
                            const cityIdMatch = a?.city_id === filters.city;
                            return cityMatch || cityIdMatch;
                        })
                        .map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>

            {/* Institute */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Institute</label>
                <select 
                    value={filters.institute} 
                    onChange={(e) => updateFilter('institute', e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 shadow-sm appearance-none transition-all cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                >
                    <option value="">All Institutions</option>
                    {INSTITUTIONS
                        .filter(inst => {
                            if (!filters.city) return true;
                            return inst.city === filters.city;
                        })
                        .map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.name} ({inst.type})</option>
                    ))}
                </select>
            </div>

            {/* Hostel Gender */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Hostel Gender</label>
                <div className="space-y-3">
                    {[
                        { id: '', name: 'All Hostels' },
                        { id: 'boys_only', name: 'Boys Only' },
                        { id: 'girls_only', name: 'Girls Only' },
                    ].map((g) => (
                        <label key={g.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="genderType" 
                                value={g.id} 
                                checked={filters.genderType === g.id} 
                                onChange={() => updateFilter('genderType', g.id)} 
                                className="w-5 h-5 text-primary-500 border-gray-200 focus:ring-primary-200 transition-all cursor-pointer" 
                            />
                            <span className="text-sm font-medium text-gray-500 group-hover:text-[#0B1A30] transition-colors">{g.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Price Range</label>
                <div className="space-y-3">
                    {PRICE_RANGES.map((r) => (
                        <label key={r.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="price" 
                                value={r.id} 
                                checked={filters.priceRange === r.id} 
                                onChange={() => updateFilter('priceRange', r.id)} 
                                className="w-5 h-5 text-primary-500 border-gray-200 focus:ring-primary-200 transition-all cursor-pointer" 
                            />
                            <span className="text-sm font-medium text-gray-500 group-hover:text-[#0B1A30] transition-colors">{r.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Room Type */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Room Type</label>
                <div className="space-y-3">
                    {ROOM_TYPES.map((t) => (
                        <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="roomType" 
                                value={t.id} 
                                checked={filters.roomType === t.id} 
                                onChange={() => updateFilter('roomType', t.id)} 
                                className="w-5 h-5 text-primary-500 border-gray-200 focus:ring-primary-200 transition-all cursor-pointer" 
                            />
                            <span className="text-sm font-medium text-gray-500 group-hover:text-[#0B1A30] transition-colors">{t.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Amenities */}
            <div>
                <label className="block text-sm font-bold text-[#0B1A30] mb-3">Amenities</label>
                <div className="flex flex-wrap gap-2">
                    {(dynamicAmenities.length > 0 ? dynamicAmenities : AMENITIES).map((amenity) => {
                        const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                        const amenitySlug = typeof amenity === 'string' ? amenity : amenity.slug;
                        const isSelected = filters.amenities.includes(amenitySlug);
                        return (
                            <button
                                key={amenitySlug}
                                onClick={() => toggleAmenity(amenitySlug)}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                                    isSelected 
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-md' 
                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {amenityName}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="w-full py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    Clear All Filters ({activeFilterCount})
                </button>
            )}
        </div>
    );

    // Get dynamic header data
    const getHeaderData = () => {
        const fallbackImage = (query, location = '') => `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2070&auto=format&fit=crop&sig=${encodeURIComponent(query + ' ' + location)}`;

        if (filters.institute) {
            const uni = UNIVERSITY_FEATURES.find(u => u.id === filters.institute) || dynamicInstitutions.find(u => u.id === filters.institute);
            if (uni) return { 
                title: uni.name, 
                subtitle: `Hostels near ${uni.name}${uni.area ? `, ${uni.area}` : ''}`, 
                image: uni.image || fallbackImage(uni.name, uni.city || '') 
            };
        }
        if (filters.area) {
            const area = POPULAR_AREAS.find(a => a.id === filters.area.toLowerCase() || a.name.toLowerCase() === filters.area.toLowerCase()) || dynamicAreas.find(a => a.id === filters.area.toLowerCase());
            if (area) return { 
                title: area.name, 
                subtitle: `Verified accommodation in ${area.name}, ${area.city || filters.city || ''}`, 
                image: area.image || fallbackImage(area.name, area.city || filters.city || '') 
            };
        }
        if (filters.city) {
            const city = CITIES.find(c => c.id === filters.city) || dynamicCities.find(c => c.id === filters.city);
            if (city) return { 
                title: city.name, 
                subtitle: `Student housing in ${city.name}, KPK`, 
                image: city.image || fallbackImage(city.name, 'Pakistan City') 
            };
        }
        return { 
            title: 'Student Accommodations', 
            subtitle: 'Explore verified hostels across Abbottabad & Mansehra', 
            image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2070&auto=format&fit=crop' 
        };
    };

    const headerData = getHeaderData();

    return (
        <div className="pt-16 pb-16 min-h-screen bg-white">
            {/* Dynamic Hero Section */}
            <section className="relative h-[300px] sm:h-[350px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={headerData.image}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.8 }}
                            src={headerData.image}
                            alt={headerData.title}
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 backdrop-blur-md border border-primary-500/30 text-primary-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Verified Listings
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                            {headerData.title}
                        </h1>
                        <p className="text-gray-300 text-lg font-medium">
                            {headerData.subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Info Bar */}
                <div className="py-6 flex flex-col sm:flex-row items-center justify-between border-b border-border-light mb-8">
                    <p className="text-sm text-text-muted font-medium">
                        Found <span className="text-[#0B1A30] font-black">{hostelsData.length}</span> verified results
                    </p>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {filters.city && <span className="px-3 py-1 rounded-full bg-gray-100 text-[#0B1A30] text-[10px] font-black uppercase tracking-widest">{filters.city}</span>}
                        {filters.university && <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest">Near {filters.university.replace('-', ' ')}</span>}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-border-light">
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary-300 transition-colors shadow-sm"
                    >
                        <FiFilter size={16} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
                        )}
                    </button>

                    {/* Mobile Floating Filter FAB */}
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileFiltersOpen(true)}
                        className="lg:hidden fixed bottom-20 right-6 z-[60] w-14 h-14 rounded-full gradient-primary text-white flex items-center justify-center shadow-2xl"
                    >
                        <div className="relative">
                            <FiFilter size={24} />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">{activeFilterCount}</span>
                            )}
                        </div>
                    </motion.button>

                    <div className="flex items-center gap-3 ml-auto">
                        <select
                            value={filters.sortBy}
                            onChange={(e) => updateFilter('sortBy', e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                        >
                            <option value="rating">Top Rated</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="reviews">Most Reviewed</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl border border-border-light p-6 shadow-card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-text-primary">Filters</h3>
                                {activeFilterCount > 0 && (
                                    <span className="text-xs text-primary-600 font-medium">{activeFilterCount} active</span>
                                )}
                            </div>
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => <HostelCardSkeleton key={i} />)}
                            </div>
                        ) : paginatedHostels.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {paginatedHostels.map((hostel, i) => (
                                        <HostelCard key={hostel.id} hostel={hostel} index={i} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-primary-50 hover:border-primary-300 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage === i + 1 ? 'gradient-primary text-white shadow-md' : 'border border-border hover:bg-primary-50 hover:border-primary-300'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-primary-50 hover:border-primary-300 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState title="No hostels found" description="Try adjusting your filters to see more results." action={<Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>} />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white z-[120] lg:hidden overflow-y-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
                        >
                            {/* Handle bar */}
                            <div className="sticky top-0 bg-white pt-4 pb-2 flex justify-center z-10">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                            </div>
                            
                            <div className="p-8 pt-2">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter">Refine Search</h3>
                                    <button onClick={() => setMobileFiltersOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <FilterSidebar />
                                <div className="mt-8 pt-4">
                                    <Button className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest" onClick={() => setMobileFiltersOpen(false)}>
                                        Show {hostelsData.length} Results
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
