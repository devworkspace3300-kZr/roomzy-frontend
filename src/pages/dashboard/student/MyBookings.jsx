import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCalendar, FiMapPin, FiClock, FiCheck, FiX, FiAlertCircle,
    FiSearch, FiStar, FiArrowRight
} from 'react-icons/fi';
import { LuBed } from 'react-icons/lu';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { STUDENT_TABS } from '../../../constants/tabs';

const STATUS_CONFIG = {
    pending:          { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: FiClock },
    approved:         { label: 'Approved', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', icon: FiCheck },
    rejected:         { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400', icon: FiX },
    awaiting_payment: { label: 'Awaiting Payment', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', icon: FiAlertCircle },
    confirmed:        { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: FiCheck },
    active_stay:      { label: 'Active Stay', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: FiCheck },
    completed:        { label: 'Completed', color: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: FiCheck },
    cancelled:        { label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-100', dot: 'bg-red-300', icon: FiX },
};

const ROOM_TYPE_LABELS = {
    single: 'Single', double: 'Double', triple: 'Triple', quad: 'Quad', dormitory: 'Dormitory',
};

const STATUS_FILTERS = ['all', 'pending', 'approved', 'confirmed', 'active_stay', 'completed', 'rejected', 'cancelled'];

export default function MyBookings({ noLayout = false }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Review Modal States
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ overall_rating: 5, body: '', title: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Detail modal
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        api.get('/bookings/my')
            .then(res => setBookings(res.data?.data || []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '—';
        try { return date.toLocaleDateString('en-GB', options); }
        catch (e) { return '—'; }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this booking request?')) return;
        setCancelling(id);
        try {
            await api.patch(`/bookings/${id}/cancel`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            toast.success('Booking cancelled');
            setSelectedBooking(prev => prev?.id === id ? { ...prev, status: 'cancelled' } : prev);
        } catch {
            toast.error('Failed to cancel');
        } finally {
            setCancelling(null);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post(`/reviews/${selectedBookingForReview.id}`, reviewForm);
            toast.success('Review submitted successfully! It will be published after moderation.');
            setBookings(prev => prev.map(b => b.id === selectedBookingForReview.id ? { ...b, hasReview: true } : b));
            setSelectedBookingForReview(null);
            setReviewForm({ overall_rating: 5, body: '', title: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };



    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchesSearch = !searchTerm ||
            b.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.hostel?.city?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusCounts = STATUS_FILTERS.reduce((acc, s) => {
        acc[s] = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
        return acc;
    }, {});

    const Content = (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">My Bookings</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Track and manage all your accommodation requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-[#0B1A30] text-white text-xs font-black uppercase tracking-widest rounded-xl">
                        {bookings.length} Total
                    </span>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-4 space-y-3">
                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by hostel name or city..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0B1A30]/30 focus:bg-white transition-all"
                    />
                </div>
                {/* Status Filter Pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {STATUS_FILTERS.map(s => {
                        const count = statusCounts[s];
                        if (s !== 'all' && count === 0) return null;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border whitespace-nowrap transition-all ${
                                    statusFilter === s
                                        ? 'bg-[#0B1A30] text-white border-[#0B1A30]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {s.replace('_', ' ')}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-36 animate-shimmer rounded-[1.5rem]" />
                    ))}
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <FiCalendar size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">
                        {statusFilter === 'all' ? 'No Bookings Yet' : `No ${statusFilter.replace('_', ' ')} Bookings`}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        {statusFilter === 'all'
                            ? 'Find your perfect hostel and make your first booking.'
                            : 'No bookings match the selected filter.'}
                    </p>
                    {statusFilter === 'all' ? (
                        <Link to="/listings" className="inline-block px-6 py-3 bg-[#0B1A30] text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-colors">
                            Browse Hostels
                        </Link>
                    ) : (
                        <button onClick={() => setStatusFilter('all')} className="inline-block px-6 py-3 bg-gray-100 text-[#0B1A30] text-sm font-black rounded-2xl hover:bg-gray-200 transition-colors">
                            Show All Bookings
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking, i) => {
                        const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;
                        const coverImg = booking.hostel?.images?.[0]?.imageUrl || booking.hostel?.images?.[0]?.url || booking.hostel?.images?.[0]
                            || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
                        const isActive = ['active_stay', 'confirmed', 'approved'].includes(booking.status);

                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-white rounded-[1.75rem] border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer ${isActive ? 'border-emerald-100' : 'border-gray-100'}`}
                                onClick={() => setSelectedBooking(booking)}
                            >
                                {/* Active stay highlight strip */}
                                {isActive && <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />}

                                <div className="flex flex-col sm:flex-row">
                                    {/* Hostel Image */}
                                    <div className="relative w-full sm:w-44 md:w-52 shrink-0 h-44 sm:h-auto overflow-hidden">
                                        <img
                                            src={coverImg}
                                            alt={booking.hostel?.name}
                                            className="w-full h-full object-cover"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-none" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                                        <div>
                                            {/* Header Row */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-[900] text-[#0B1A30] text-base leading-tight truncate">
                                                        {booking.hostel?.name || 'Hostel'}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                                                        <FiMapPin size={11} />
                                                        <span className="truncate">{booking.hostel?.area}, {booking.hostel?.city}</span>
                                                    </div>
                                                </div>
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${cfg.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-gray-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Room</p>
                                                    <p className="text-xs font-bold text-[#0B1A30]">{ROOM_TYPE_LABELS[booking.room?.roomType] || booking.room?.roomType || '—'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Move-in</p>
                                                    <p className="text-xs font-bold text-[#0B1A30]">{formatDate(booking.moveInDate, { day: 'numeric', month: 'short' })}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
                                                    <p className="text-xs font-bold text-[#0B1A30]">{booking.durationMonths}mo</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Monthly</p>
                                                    <p className="text-xs font-bold text-[#0B1A30]">PKR {booking.monthlyPrice?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-50">
                                            {booking.status === 'pending' && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleCancel(booking.id); }}
                                                    disabled={cancelling === booking.id}
                                                    className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                                                >
                                                    {cancelling === booking.id ? 'Cancelling...' : '✕ Cancel Request'}
                                                </button>
                                            )}

                                            {booking.status === 'approved' && (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl border border-blue-100">
                                                    <FiAlertCircle size={12} /> Awaiting physical payment & owner confirmation
                                                </span>
                                            )}

                                            {(['completed', 'active_stay', 'confirmed'].includes(booking.status) && !booking.hasReview) && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelectedBookingForReview(booking); }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-100 transition-all"
                                                >
                                                    <FiStar size={12} /> Leave a Review
                                                </button>
                                            )}

                                            {booking.status === 'rejected' && booking.rejectionReason && (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-xl border border-red-100">
                                                    <FiAlertCircle size={12} /> {booking.rejectionReason}
                                                </span>
                                            )}

                                            <span className="text-[9px] text-gray-400 font-bold ml-auto self-center">
                                                Requested {formatDate(booking.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ─── Booking Detail Slide-over Modal ─── */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBooking(null)}
                            className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header Image */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={selectedBooking.hostel?.images?.[0]?.imageUrl || selectedBooking.hostel?.images?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors"
                                >
                                    <FiX size={18} />
                                </button>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <h3 className="text-2xl font-[900] text-white tracking-tight">{selectedBooking.hostel?.name}</h3>
                                    <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1">
                                        <FiMapPin size={12} /> {selectedBooking.hostel?.area}, {selectedBooking.hostel?.city}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Status Banner */}
                                {(() => {
                                    const cfg = STATUS_CONFIG[selectedBooking.status] || STATUS_CONFIG.pending;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${cfg.color}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${['active_stay','confirmed','approved'].includes(selectedBooking.status) ? 'animate-pulse' : ''}`} />
                                            <span className="font-black uppercase tracking-widest text-xs">{cfg.label}</span>
                                        </div>
                                    );
                                })()}

                                {/* Approved Payment Notice */}
                                {selectedBooking.status === 'approved' && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-2">Booking Approved — Physical Payment Required</p>
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            Please make physical payment of PKR {selectedBooking.monthlyPrice?.toLocaleString()} directly to the hostel owner. Once they receive it, they will confirm your booking.
                                        </p>
                                        {selectedBooking.hostel?.owner?.phone && (
                                            <div className="mt-3 pt-3 border-t border-blue-100">
                                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Owner Contact Number</p>
                                                <p className="text-sm font-black text-blue-900 mt-0.5">{selectedBooking.hostel.owner.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rejection Notice */}
                                {selectedBooking.status === 'rejected' && selectedBooking.rejectionReason && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                        <FiAlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">Rejection Reason</p>
                                            <p className="text-xs text-red-700 font-medium mt-0.5">{selectedBooking.rejectionReason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Room Type', value: ROOM_TYPE_LABELS[selectedBooking.room?.roomType] || '—' },
                                        { label: 'Move-in Date', value: formatDate(selectedBooking.moveInDate) },
                                        { label: 'Duration', value: `${selectedBooking.durationMonths} month${selectedBooking.durationMonths > 1 ? 's' : ''}` },
                                        { label: 'Monthly Rent', value: `PKR ${selectedBooking.monthlyPrice?.toLocaleString() || '—'}` },
                                        { label: 'Hostel Gender', value: selectedBooking.hostel?.gender ? (selectedBooking.hostel.gender.charAt(0).toUpperCase() + selectedBooking.hostel.gender.slice(1)) : '—' },
                                        { label: 'Requested On', value: formatDate(selectedBooking.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-[#0B1A30]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Amenities */}
                                {selectedBooking.hostel?.amenities && selectedBooking.hostel.amenities.length > 0 && (
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Amenities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedBooking.hostel.amenities.map((a, i) => (
                                                <span key={i} className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-xl">✓ {a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                                    {selectedBooking.status === 'pending' && (
                                        <button
                                            onClick={() => { handleCancel(selectedBooking.id); setSelectedBooking(null); }}
                                            disabled={cancelling === selectedBooking.id}
                                            className="flex-1 py-3 border-2 border-red-100 text-red-500 text-[11px] font-black uppercase tracking-wider rounded-2xl hover:bg-red-50 transition-colors"
                                        >
                                            {cancelling === selectedBooking.id ? 'Cancelling...' : 'Cancel Request'}
                                        </button>
                                    )}

                                    {selectedBooking.status === 'approved' && (
                                        <div className="w-full text-center py-3 text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 rounded-xl">
                                            Awaiting physical payment & owner confirmation
                                        </div>
                                    )}

                                    {(['completed', 'active_stay', 'confirmed'].includes(selectedBooking.status) && !selectedBooking.hasReview) && (
                                        <button
                                            onClick={() => { setSelectedBookingForReview(selectedBooking); setSelectedBooking(null); }}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider rounded-2xl hover:bg-amber-600 transition-all shadow-md"
                                        >
                                            <FiStar size={14} /> Leave a Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Review Modal ─── */}
            <AnimatePresence>
                {selectedBookingForReview && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBookingForReview(null)}
                            className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-[900] text-[#0B1A30]">Rate Your Stay</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">at {selectedBookingForReview.hostel?.name}</p>
                                </div>
                                <button onClick={() => setSelectedBookingForReview(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors">
                                    <FiX size={16} />
                                </button>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <form onSubmit={handleSubmitReview} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Overall Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, overall_rating: star })}
                                                    className={`text-3xl transition-all hover:scale-125 ${reviewForm.overall_rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                                                >★</button>
                                            ))}
                                            <span className="ml-2 text-sm font-black text-gray-400 self-center">{reviewForm.overall_rating}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Review Title</label>
                                        <input
                                            type="text"
                                            placeholder="Summarize your experience"
                                            value={reviewForm.title}
                                            onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0B1A30]/20 font-medium text-sm text-[#0B1A30]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Detailed Review</label>
                                        <textarea
                                            rows="4"
                                            placeholder="What did you like or dislike? How were the facilities?"
                                            value={reviewForm.body}
                                            onChange={e => setReviewForm({ ...reviewForm, body: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0B1A30]/20 font-medium text-sm text-[#0B1A30] resize-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full py-4 bg-[#0B1A30] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    if (noLayout) return Content;

    return (
        <DashboardLayout tabs={STUDENT_TABS} activeTab="bookings" setActiveTab={() => {}}>
            {Content}
        </DashboardLayout>
    );
}
