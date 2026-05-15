import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar, FiHeart, FiCheck } from 'react-icons/fi';
import { HiCheckBadge } from 'react-icons/hi2';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Normalize both static-data shape and API shape into a unified card object
function normalizeHostel(hostel) {
    const isApiShape = !hostel.image && (hostel.images || hostel.startingPrice !== undefined);
    if (!isApiShape) return hostel; // Already in static/HostelCard shape

    const coverImage = hostel.images?.[0]?.imageUrl ?? hostel.images?.[0] ?? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80';
    const genderMap = { boys_only: 'male', girls_only: 'female', co_ed: 'mixed' };

    const roomType = hostel.rooms?.[0]?.roomType || null;
    const availableRoomsCount = hostel.rooms?.filter(r => r.availableBeds > 0).length ?? null;

    return {
        ...hostel,
        image: coverImage,
        price: hostel.startingPrice || 0,
        city: hostel.city?.toLowerCase() || '',
        isVerified: hostel.status === 'verified',
        gender: genderMap[hostel.genderType] || 'mixed',
        nearUniversity: hostel.area || hostel.city || '',
        rating: hostel.averageRating || null,
        reviewCount: hostel.totalReviews || 0,
        distanceFromUni: hostel.instituteDistanceKm ? `${hostel.instituteDistanceKm} km` : '',
        availableRooms: availableRoomsCount,
        roomType: roomType,
    };
}

export default function HostelCard({ hostel: rawHostel, index = 0 }) {
    const { user, isAuthenticated } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const hostel = normalizeHostel(rawHostel);

    useEffect(() => {
        // If the API provided a saved status (e.g. from student dashboard)
        if (rawHostel.isSaved !== undefined) {
            setIsSaved(rawHostel.isSaved);
        }
    }, [rawHostel.isSaved]);

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please log in to save hostels');
            return;
        }

        if (user?.role !== 'student') {
            toast.error('Only students can save hostels');
            return;
        }

        try {
            setIsSaved(!isSaved);
            await api.post(`/student/favorite/${hostel.id}`);
            toast.success(isSaved ? 'Removed from favorites' : 'Saved to favorites');
        } catch (error) {
            setIsSaved(isSaved); // Revert on error
            toast.error('Failed to save hostel');
        }
    };

    const roomTypeLabels = {
        single: 'Single', double: 'Double', triple: 'Triple',
        quad: 'Quad', dormitory: 'Dorm',
    };

    const genderLabel = { female: 'Girls Only', male: 'Boys Only' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border-light"
        >
            <Link to={`/hostel/${hostel.id}`} className="block">
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                        src={hostel.image}
                        alt={hostel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {hostel.isVerified && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500/90 backdrop-blur-sm text-white text-xs font-semibold">
                                <HiCheckBadge size={14} /> Verified
                            </span>
                        )}
                        {hostel.gender && genderLabel[hostel.gender] && (
                            <span className="px-2.5 py-1 rounded-full bg-pink-500/90 backdrop-blur-sm text-white text-xs font-semibold">
                                {genderLabel[hostel.gender]}
                            </span>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${isSaved ? 'bg-red-500 text-white' : 'bg-white/80 text-text-secondary hover:bg-white hover:text-red-500'}`}
                    >
                        <FiHeart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>

                    {/* Price */}
                    {hostel.price > 0 && (
                        <div className="absolute bottom-3 right-3">
                            <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-primary-700 text-sm font-bold shadow-sm">
                                ₨{hostel.price.toLocaleString()}<span className="text-xs font-normal text-text-muted">/mo</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors line-clamp-1">
                            {hostel.name}
                        </h3>
                        {hostel.rating && (
                            <div className="flex items-center gap-1 shrink-0">
                                <FiStar size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-semibold">{hostel.rating}</span>
                                <span className="text-xs text-text-muted">({hostel.reviewCount})</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-text-muted text-sm mb-3">
                        <FiMapPin size={13} />
                        <span className="line-clamp-1">
                            {hostel.nearUniversity}
                            {hostel.city ? ` · ${hostel.city.charAt(0).toUpperCase() + hostel.city.slice(1)}` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        {hostel.roomType && (
                            <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 text-xs font-medium">
                                {roomTypeLabels[hostel.roomType] || hostel.roomType}
                            </span>
                        )}
                        {hostel.distanceFromUni && (
                            <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-text-secondary text-xs font-medium">
                                {hostel.distanceFromUni}
                            </span>
                        )}
                        {hostel.availableRooms !== null && hostel.availableRooms <= 3 && hostel.availableRooms >= 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
                                {hostel.availableRooms} left
                            </span>
                        )}
                    </div>

                    {/* Amenities Snippet for Trust */}
                    {hostel.amenities && hostel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
                            {hostel.amenities.slice(0, 3).map((amenity, i) => (
                                <div key={i} className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    <FiCheck size={10} className="text-emerald-500" />
                                    {amenity.name}
                                </div>
                            ))}
                            {hostel.amenities.length > 3 && (
                                <span className="text-[10px] font-bold text-gray-300">+{hostel.amenities.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
