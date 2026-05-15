import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { LuBed } from 'react-icons/lu';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { STUDENT_TABS } from '../../../constants/tabs';

const STATUS_CONFIG = {
    pending:          { label: 'Pending',          color: 'bg-amber-50 text-amber-600',   icon: FiClock },
    approved:         { label: 'Approved',          color: 'bg-blue-50 text-blue-600',    icon: FiCheck },
    rejected:         { label: 'Rejected',          color: 'bg-red-50 text-red-600',      icon: FiX },
    awaiting_payment: { label: 'Awaiting Payment',  color: 'bg-purple-50 text-purple-600', icon: FiAlertCircle },
    confirmed:        { label: 'Confirmed',         color: 'bg-emerald-50 text-emerald-600', icon: FiCheck },
    active_stay:      { label: 'Active Stay',       color: 'bg-emerald-50 text-emerald-600', icon: FiCheck },
    completed:        { label: 'Completed',         color: 'bg-gray-50 text-gray-500',    icon: FiCheck },
    cancelled:        { label: 'Cancelled',         color: 'bg-red-50 text-red-400',      icon: FiX },
};

export default function MyBookings({ noLayout = false }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        api.get('/bookings/my')
            .then(res => setBookings(res.data?.data || []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr, options) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '—';
        try {
            return date.toLocaleDateString('en-GB', options);
        } catch (e) {
            return '—';
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this booking request?')) return;
        setCancelling(id);
        try {
            await api.patch(`/bookings/${id}/cancel`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            toast.success('Booking cancelled');
        } catch {
            toast.error('Failed to cancel');
        } finally {
            setCancelling(null);
        }
    };

    const handlePayNow = async (bookingId) => {
        try {
            toast.loading('Preparing secure payment...', { id: 'payment' });
            const response = await api.post(`/payments/initiate/${bookingId}`);
            const { url, params } = response.data;
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = url;
            
            Object.entries(params).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            
            document.body.appendChild(form);
            toast.dismiss('payment');
            form.submit();
        } catch (error) {
            toast.error('Failed to initiate payment. Please try again.', { id: 'payment' });
        }
    };

    const ROOM_TYPE_LABELS = {
        single: 'Single', double: 'Double', triple: 'Triple', quad: 'Quad', dormitory: 'Dormitory',
    };

    const Content = (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
            <div>
                <h2 className="text-2xl font-[900] text-[#0B1A30] tracking-tight">My Bookings</h2>
                <p className="text-gray-500 text-sm mt-1">Track all your accommodation requests and stays.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 animate-shimmer rounded-2xl" />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-16 text-center">
                    <FiCalendar size={40} className="mx-auto mb-4 text-gray-200" />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">No bookings yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-6">Find your perfect hostel and make your first booking.</p>
                    <Link to="/listings" className="inline-block px-6 py-3 bg-[#0B1A30] text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-colors">
                        Browse Hostels
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking, i) => {
                        const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;
                        const coverImg = booking.hostel?.images?.[0]?.imageUrl || booking.hostel?.images?.[0]?.url || booking.hostel?.images?.[0]
                            || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80';

                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="flex gap-0">
                                    {/* Image */}
                                    <div className="w-32 sm:w-44 shrink-0">
                                        <img
                                            src={coverImg}
                                            alt={booking.hostel?.name}
                                            className="w-full h-full object-cover"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'; }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-[900] text-[#0B1A30] text-base leading-tight">
                                                        {booking.hostel?.name || 'Hostel'}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                                        <FiMapPin size={11} />
                                                        <span>{booking.hostel?.area}, {booking.hostel?.city}</span>
                                                    </div>
                                                </div>
                                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${cfg.color}`}>
                                                    <StatusIcon size={11} /> {cfg.label}
                                                </span>
                                            </div>

                                            {booking.status === 'approved' && (
                                                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                                                        <FiClock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Payment Required within 24h</p>
                                                        <p className="text-[11px] text-blue-700 font-medium leading-tight">Pay now to secure your bed. This request will auto-expire if not paid.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {booking.status === 'rejected' && booking.rejectionReason && (
                                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                                                        <FiAlertCircle size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">Request Rejected</p>
                                                        <p className="text-[11px] text-red-700 font-medium leading-tight">Reason: {booking.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {booking.status === 'cancelled' && booking.cancellationReason && (
                                                <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center text-white shrink-0">
                                                        <FiX size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Booking Cancelled</p>
                                                        <p className="text-[11px] text-gray-700 font-medium leading-tight">{booking.cancellationReason}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Room Type</p>
                                                    <p className="text-xs font-bold text-[#0B1A30] mt-0.5">
                                                        {ROOM_TYPE_LABELS[booking.room?.roomType] || booking.room?.roomType || '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Move-in</p>
                                                    <p className="text-sm font-bold text-[#0B1A30]">
                                                        {formatDate(booking?.moveInDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                                                    <p className="text-xs font-bold text-[#0B1A30] mt-0.5">{booking.durationMonths} month{booking.durationMonths > 1 ? 's' : ''}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Monthly</p>
                                                    <p className="text-xs font-bold text-[#0B1A30] mt-0.5">PKR {booking.monthlyPrice?.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Requested On</p>
                                                    <p className="text-xs font-bold text-[#0B1A30] mt-0.5">
                                                        {formatDate(booking?.createdAt, { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>


                                        </div>

                                        {booking.status === 'pending' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={cancelling === booking.id}
                                                    className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    {cancelling === booking.id ? 'Cancelling...' : 'Cancel Request'}
                                                </button>
                                            </div>
                                        )}

                                        {booking.status === 'approved' && (
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handlePayNow(booking.id)}
                                                    className="px-6 py-2.5 bg-[#0B1A30] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-md shadow-[#0B1A30]/10"
                                                >
                                                    Pay Now to Confirm
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (noLayout) return Content;

    return (
        <DashboardLayout tabs={STUDENT_TABS} activeTab="bookings" setActiveTab={() => {}}>
            {Content}
        </DashboardLayout>
    );
}
