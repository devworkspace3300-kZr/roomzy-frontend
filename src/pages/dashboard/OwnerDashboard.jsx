import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiHome, FiInbox, FiUsers, FiDollarSign, FiPieChart, FiTrendingUp, FiCheck, FiX, FiMoreVertical, FiPlus, FiClock, FiMessageSquare } from 'react-icons/fi';
import { LuBed } from 'react-icons/lu';
import { HiCheckBadge } from 'react-icons/hi2';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { OWNER_TABS } from '../../constants/tabs';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import VerificationBanner from '../../components/dashboard/VerificationBanner';
import toast from 'react-hot-toast';

// ─── Unified Professional Stat Card Component ───────────────────────────
function StatCard({ label, value, badge, badgeColor, borderClass, prefix }) {
    return (
        <div className={`bg-white rounded-r-2xl rounded-l-sm p-6 shadow-sm border border-gray-100 border-l-[5px] ${borderClass} flex flex-col justify-between h-32 hover:shadow-md transition-all duration-300`}>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    {prefix && <span className="text-xs font-bold text-gray-400 mr-1">{prefix}</span>}
                    <span className="text-3xl font-[900] text-[#0B1A30] tracking-tight">{value}</span>
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${badgeColor}`}>
                    {badge}
                </div>
            </div>
        </div>
    );
}

export default function OwnerDashboard() {
    const { verificationStatus, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const location = useLocation();
    const [myHostels, setMyHostels] = useState([]);
    const [loadingHostels, setLoadingHostels] = useState(true);
    const [bookings, setBookings] = useState([]);
    const activeStays = bookings?.filter(b => b.status === 'active_stay' || b.status === 'confirmed') || [];
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [hostelRooms, setHostelRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [statusUpdating, setStatusUpdating] = useState(null);

    // Messages tab state
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Earnings tab states
    const [earnings, setEarnings] = useState({ totalRevenue: 0, platformFees: 0, netPayout: 0, totalTransactions: 0, recentTransactions: [] });
    const [loadingEarnings, setLoadingEarnings] = useState(false);

    const fetchEarnings = async () => {
        setLoadingEarnings(true);
        try {
            const response = await api.get('/payments/owner/earnings');
            setEarnings(response.data || { totalRevenue: 0, platformFees: 0, netPayout: 0, totalTransactions: 0, recentTransactions: [] });
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoadingEarnings(false);
        }
    };

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        api.get('/hostels/my')
            .then(res => setMyHostels(res.data?.data || []))
            .catch(() => setMyHostels([]))
            .finally(() => setLoadingHostels(false));

        api.get('/bookings/owner')
            .then(res => setBookings(res.data?.data || []))
            .catch(() => setBookings([]))
            .finally(() => setLoadingBookings(false));

        fetchEarnings();
        refreshUser();
    }, []);

    const handleBookingResponse = async (id, status) => {
        let reason = '';
        if (status === 'rejected') {
            reason = window.prompt('Please enter a rejection reason (Required):');
            if (!reason) return; // Cancel if no reason provided
        }

        setStatusUpdating(id);
        try {
            const endpoint = status === 'approved' ? `/bookings/owner/bookings/${id}/approve` : `/bookings/owner/bookings/${id}/reject`;
            const payload = status === 'rejected' ? { rejectionReason: reason } : {};
            
            await api.patch(endpoint, payload);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status, rejectionReason: reason } : b));
            toast.success(`Booking ${status === 'approved' ? 'approved' : 'rejected'}`);
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${status} booking`);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleCheckout = async (id) => {
        if (!window.confirm('Are you sure you want to check out this student? This will free up one bed.')) return;
        
        setStatusUpdating(id);
        try {
            await api.patch(`/bookings/owner/active-stays/${id}/checkout`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
            toast.success('Student checked out successfully');
        } catch (error) {
            toast.error('Failed to checkout student');
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleConfirmPayment = async (id) => {
        if (!window.confirm('Confirm that you have received the physical payment? This will finalize the booking and occupy one bed.')) return;
        
        setStatusUpdating(id);
        try {
            await api.patch(`/bookings/owner/bookings/${id}/confirm-payment`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
            toast.success('Payment confirmed! Booking is now active.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm payment');
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleConfirmMoveIn = async (id) => {
        if (!window.confirm('Confirm that the student has arrived and successfully moved in? This will activate their residency.')) return;
        
        setStatusUpdating(id);
        try {
            await api.patch(`/bookings/owner/bookings/${id}/move-in`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'active_stay' } : b));
            toast.success('Move-in confirmed! Tenancy is now active.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm move-in');
        } finally {
            setStatusUpdating(null);
        }
    };

    const fetchHostelRooms = async (hostelId) => {
        setLoadingRooms(true);
        try {
            const res = await api.get(`/rooms/manage?hostelId=${hostelId}`);
            setHostelRooms(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setHostelRooms([]);
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        if (selectedHostel) {
            fetchHostelRooms(selectedHostel.id);
        }
    }, [selectedHostel]);

    useEffect(() => {
        if (activeTab === 'messages') {
            fetchConversations();
        }
        if (activeTab === 'earnings') {
            fetchEarnings();
        }
    }, [activeTab]);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data?.data || []);
        } catch (error) {
            toast.error('Failed to load conversations');
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchChatMessages = async (conversationId) => {
        try {
            const response = await api.get(`/chat/messages/${conversationId}`);
            setChatMessages(response.data?.data || []);
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;
        try {
            await api.post('/chat/direct', {
                conversationId: selectedConversation.id,
                recipientId: selectedConversation.studentId,
                hostelId: selectedConversation.hostelId,
                content: newMessage
            });
            setNewMessage('');
            fetchChatMessages(selectedConversation.id);
            fetchConversations();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const verified   = myHostels.filter(h => h.status === 'verified').length;
    const pending    = myHostels.filter(h => h.status === 'submitted').length;
    const rejected   = myHostels.filter(h => h.status === 'rejected').length;

    const getTimeRemaining = (approvedAt) => {
        if (!approvedAt) return null;
        const deadline = new Date(approvedAt);
        deadline.setHours(deadline.getHours() + 24);
        const now = new Date();
        const diff = deadline - now;
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m`;
    };

    return (
        <DashboardLayout tabs={OWNER_TABS} activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in pb-8 w-full max-w-full overflow-x-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Hostel Management</h2>
                                {verificationStatus !== 'verified' && (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2 ${
                                        verificationStatus === 'under_review' ? 'bg-primary-50 text-primary-600 border border-primary-100' :
                                        verificationStatus === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                        {verificationStatus === 'under_review' && <FiClock className="animate-spin" />}
                                        {verificationStatus.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 mt-1 font-medium">Review your property performance and requests</p>
                        </div>
                        <Button 
                            onClick={() => {
                                if (verificationStatus !== 'verified') {
                                    toast.error('Verification Required: Please verify your identity first.');
                                    navigate('/dashboard/owner/verify');
                                    return;
                                }
                                navigate('/dashboard/owner/list-hostel');
                            }}
                            size="sm" 
                            className="bg-[#0B1A30] hover:bg-gray-800 w-full sm:w-auto"
                        >
                            + List New Hostel
                        </Button>
                    </div>

                    <VerificationBanner />

                    {/* Stats Grid - Real Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard 
                            label="Pending Requests" 
                            value={bookings.filter(b => b.status === 'pending').length} 
                            badge="Review Needed" 
                            badgeColor="bg-amber-50 text-amber-600" 
                            borderClass="border-amber-500" 
                        />
                        <StatCard
                            label="Active Tenants"
                            value={loadingBookings ? '...' : bookings.filter(b => ['active_stay', 'approved', 'confirmed'].includes(b.status)).length}
                            badge="Live Stays"
                            badgeColor="text-emerald-600 bg-emerald-50"
                            borderClass="border-emerald-500"
                        />
                        <StatCard
                            label="Total Properties"
                            value={loadingHostels ? '...' : myHostels.length}
                            badge={pending > 0 ? `${pending} Pending` : 'All Set'}
                            badgeColor={pending > 0 ? 'text-amber-600 bg-amber-50' : 'text-gray-400 bg-gray-50'}
                            borderClass="border-[#0B1A30]"
                        />
                        <StatCard
                            label="Verified Hostels"
                            value={loadingHostels ? '...' : verified}
                            badge={`${Math.round((verified/myHostels.length)*100)||0}% Verified`}
                            badgeColor="text-primary-600 bg-primary-50"
                            borderClass="border-primary-500"
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
                        {/* Main Column */}
                        <div className="flex-1 space-y-6 lg:space-y-8 min-w-0">
                            
                            {/* Revenue Trend Chart - Unified Colors */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter flex items-center gap-2">
                                        <FiTrendingUp className="text-primary-500"/> Revenue Analytics
                                    </h3>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#0B1A30]"></span> Monthly
                                        </span>
                                    </div>
                                </div>
                                <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-1">
                                    {[
                                        { month: 'JUN', height: '55%' },
                                        { month: 'JUL', height: '40%' },
                                        { month: 'AUG', height: '65%' },
                                        { month: 'SEP', height: '50%' },
                                        { month: 'OCT', height: '90%', val: '842k', active: true },
                                    ].map((bar, i) => (
                                        <div key={i} className="flex flex-col items-center flex-1 group">
                                            {bar.active && <div className="text-[10px] font-black text-[#0B1A30] mb-2 tracking-tighter">PKR {bar.val}</div>}
                                            <div className="w-full max-w-[50px] relative flex items-end justify-center" style={{ height: '180px' }}>
                                                <div 
                                                    className={`w-full rounded-t-xl transition-all duration-700 ${bar.active ? 'bg-[#0B1A30]' : 'bg-gray-100 group-hover:bg-primary-400'}`} 
                                                    style={{ height: bar.height }} 
                                                />
                                            </div>
                                            <div className={`text-[9px] font-black mt-3 tracking-widest ${bar.active ? 'text-[#0B1A30]' : 'text-gray-400'}`}>{bar.month}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* My Properties Table - Dynamic */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-gray-50/20">
                                    <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">My Properties</h3>
                                    <Button size="sm" onClick={() => navigate('/dashboard/owner/list-hostel')} className="bg-[#0B1A30] hover:bg-gray-800">
                                        <FiPlus size={14} className="mr-1" /> Add New
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    {loadingHostels ? (
                                        <div className="p-12 text-center text-gray-400">
                                            <div className="animate-spin w-6 h-6 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Loading properties...</p>
                                        </div>
                                    ) : myHostels.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <FiHome size={36} className="mx-auto mb-3 text-gray-200" />
                                            <p className="font-black text-gray-400 text-[10px] uppercase tracking-widest">No hostels listed yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Click "Add New" to submit your first property</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left min-w-[620px]">
                                            <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                                <tr>
                                                    <th className="px-6 py-4">Property</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {myHostels.map((h) => {
                                                    const coverImg = h.images?.[0]?.imageUrl || h.images?.[0]?.url || h.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80';
                                                    const statusMap = {
                                                        verified:  { label: 'Verified',  color: 'text-emerald-600 bg-emerald-50' },
                                                        submitted: { label: 'Pending',   color: 'text-amber-600 bg-amber-50' },
                                                        rejected:  { label: 'Rejected',  color: 'text-red-600 bg-red-50' },
                                                    };
                                                    const s = statusMap[h.status] || { label: h.status, color: 'text-gray-400 bg-gray-50' };
                                                    return (
                                                        <tr key={h.id} className="hover:bg-gray-50/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={coverImg}
                                                                        alt={h.name}
                                                                        className="w-10 h-10 rounded-xl object-cover"
                                                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80'; }}
                                                                    />
                                                                    <div>
                                                                        <p className="font-bold text-[#0B1A30] text-sm leading-tight">{h.name}</p>
                                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{h.area}, {h.city}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                                                            </td>
                                                            <td className="px-6 py-4 font-black text-[#0B1A30] text-xs">
                                                                {h.startingPrice ? `PKR ${h.startingPrice.toLocaleString()}` : '—'}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {h.status === 'verified' && (
                                                                    <button
                                                                        onClick={() => navigate(`/dashboard/owner/manage-rooms/${h.id}`)}
                                                                        className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg bg-[#0B1A30] text-white text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                                                                    >
                                                                        <LuBed size={12} /> Manage Rooms
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Fixed Responsiveness */}
                        <div className="w-full xl:w-80 shrink-0 space-y-6 lg:space-y-8">
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                                <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter mb-8">Active Requests</h3>
                                <div className="space-y-4">
                                    {loadingBookings ? (
                                        <div className="text-center py-4 text-gray-400">
                                            <div className="animate-spin w-5 h-5 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto" />
                                        </div>
                                    ) : bookings.filter(b => b.status === 'pending').length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-50 rounded-2xl">
                                            <FiInbox size={24} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No pending requests</p>
                                        </div>
                                    ) : (
                                        bookings.filter(b => b.status === 'pending').slice(0, 3).map((req) => (
                                            <div key={req.id} className="p-4 bg-gray-50/50 rounded-2xl group hover:bg-white transition-all border border-transparent hover:border-gray-100 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#0B1A30]/5 flex items-center justify-center text-[#0B1A30] font-black text-xs">
                                                        {req.student?.fullName?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-[13px] font-black text-[#0B1A30] tracking-tight truncate">{req.student?.fullName}</p>
                                                            <span className="text-[8px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded uppercase">New</span>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{req.hostel?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleBookingResponse(req.id, 'rejected')}
                                                        disabled={statusUpdating === req.id}
                                                        className="flex-1 py-2 text-[9px] font-black bg-white text-gray-400 border border-gray-100 hover:text-red-600 rounded-lg uppercase tracking-widest transition-colors disabled:opacity-50"
                                                    >
                                                        Decline
                                                    </button>
                                                    <button 
                                                        onClick={() => handleBookingResponse(req.id, 'approved')}
                                                        disabled={statusUpdating === req.id}
                                                        className="flex-1 py-2 text-[9px] font-black bg-[#0B1A30] text-white hover:bg-gray-800 rounded-lg shadow-md uppercase tracking-widest transition-colors disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Promotional Insights */}
                            <div className="bg-[#EEF2F6] rounded-[2rem] p-8 border border-[#E2E8F0] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B1A30]/5 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-[#0B1A30] text-white rounded-xl shadow-md"><FiTrendingUp size={18} /></div>
                                        <h3 className="text-[10px] font-black text-[#0B1A30] uppercase tracking-[0.2em]">Insights</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed mb-6 font-medium">Add professional photos to your listings to increase interest by <span className="font-black text-[#0B1A30]">40%</span>.</p>
                                    <button className="text-[9px] font-black text-primary-600 flex items-center gap-1 uppercase tracking-widest group-hover:text-[#0B1A30] transition-colors">Optimize Now →</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'hostels' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Property Inventory</h2>
                            <p className="text-gray-500 mt-1 font-medium">Manage your properties and room availability</p>
                        </div>
                        <Button 
                            onClick={() => navigate('/dashboard/owner/list-hostel')}
                            size="sm" 
                            className="bg-[#0B1A30] hover:bg-gray-800 w-full sm:w-auto"
                        >
                            + Add New Property
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Hostels List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Your Hostels</h3>
                            {loadingHostels ? (
                                <div className="p-12 bg-white rounded-[2rem] border border-gray-100 text-center">
                                    <div className="animate-spin w-5 h-5 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto" />
                                </div>
                            ) : myHostels.length === 0 ? (
                                <div className="p-8 bg-white rounded-[2rem] border border-gray-100 text-center">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No hostels found</p>
                                </div>
                            ) : (
                                myHostels.map(hostel => (
                                    <div 
                                        key={hostel.id}
                                        onClick={() => setSelectedHostel(hostel)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedHostel?.id === hostel.id ? 'bg-[#0B1A30] border-[#0B1A30] shadow-lg text-white' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}`}
                                    >
                                        <img 
                                            src={hostel.images?.[0]?.imageUrl || hostel.images?.[0]?.url || hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80'} 
                                            alt={hostel.name}
                                            className="w-12 h-12 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className={`font-black text-sm truncate ${selectedHostel?.id === hostel.id ? 'text-white' : 'text-[#0B1A30]'}`}>{hostel.name}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${selectedHostel?.id === hostel.id ? 'text-gray-300' : 'text-gray-400'}`}>{hostel.city}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Hostel Details & Rooms */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedHostel ? (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Hostel Header Card */}
                                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                                    <img 
                                                        src={selectedHostel.images?.[0]?.imageUrl || selectedHostel.images?.[0]?.url || selectedHostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=80'} 
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-2xl font-[900] text-[#0B1A30] tracking-tight">{selectedHostel.name}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedHostel.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {selectedHostel.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 font-medium text-sm">{selectedHostel.fullAddress}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => navigate(`/dashboard/owner/manage-rooms/${selectedHostel.id}`)}
                                                size="sm"
                                                className="bg-[#0B1A30] hover:bg-gray-800"
                                            >
                                                Edit Rooms
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-50">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                                <p className="text-sm font-black text-[#0B1A30] uppercase tracking-tighter">{selectedHostel.genderType.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Price</p>
                                                <p className="text-sm font-black text-[#0B1A30]">PKR {selectedHostel.startingPrice?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Rooms</p>
                                                <p className="text-sm font-black text-[#0B1A30]">{hostelRooms.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Available</p>
                                                <p className="text-sm font-black text-emerald-600">{hostelRooms.filter(r => r.isAvailable).length} Rooms</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rooms List */}
                                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Room Inventory</h4>
                                            <span className="text-[10px] font-black text-[#0B1A30] bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {hostelRooms.reduce((acc, r) => acc + r.availableBeds, 0)} Beds Available
                                            </span>
                                        </div>
                                        {loadingRooms ? (
                                            <div className="p-20 text-center">
                                                <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto" />
                                            </div>
                                        ) : hostelRooms.length === 0 ? (
                                            <div className="p-20 text-center">
                                                <LuBed size={40} className="mx-auto mb-4 text-gray-100" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No rooms added to this hostel yet</p>
                                                <Button 
                                                    onClick={() => navigate(`/dashboard/owner/manage-rooms/${selectedHostel.id}`)}
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="mt-6 border-gray-200"
                                                >
                                                    Configure Rooms
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {hostelRooms.map(room => (
                                                    <div key={room.id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#0B1A30] border border-gray-100 group-hover:bg-white transition-colors">
                                                                <LuBed size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <p className="font-black text-[#0B1A30] text-sm uppercase tracking-tighter">
                                                                        {room.roomType} Room {room.roomNumber && `#${room.roomNumber}`}
                                                                    </p>
                                                                    {room.isAvailable ? (
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                    ) : (
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                    )}
                                                                </div>
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    Floor {room.floor || 'G'} • {room.availableBeds}/{room.totalBeds} Beds Avail.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-[#0B1A30]">PKR {room.pricePerMonth?.toLocaleString()}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">per month</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                                        <FiHome size={32} className="text-gray-200" />
                                    </div>
                                    <h4 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-2">Property Details</h4>
                                    <p className="text-sm text-gray-400 max-w-xs font-medium">Select a hostel from the list on the left to view detailed inventory and room status.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Booking Requests</h2>
                        <p className="text-gray-500 mt-1 font-medium">Manage and respond to student accommodation requests</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Booking Requests ({bookings.length})</h3>
                            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                                {['all', 'pending', 'approved', 'confirmed', 'rejected', 'cancelled', 'completed'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setBookingFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${bookingFilter === s ? 'bg-[#0B1A30] text-white border-[#0B1A30]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {loadingBookings ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiInbox size={32} className="text-gray-200" />
                                </div>
                                <h4 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Requests Found</h4>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">When students book your hostels, their requests will appear here for your approval.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map((req) => (
                                    <div key={req.id} className="p-8 hover:bg-gray-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-[#0B1A30]/5 flex items-center justify-center text-[#0B1A30] text-xl font-black border border-[#0B1A30]/10">
                                                {req.student?.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-lg font-black text-[#0B1A30] tracking-tight">{req.student?.fullName}</h4>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        req.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                        req.status === 'approved' ? 'bg-blue-50 text-blue-600' :
                                                        req.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-gray-50 text-gray-500'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">Requested: {req.hostel?.name} • Room {req.room?.roomNumber || '—'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                                    Duration: {req.durationMonths} Months • Monthly: PKR {req.monthlyPrice?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {req.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleBookingResponse(req.id, 'rejected')}
                                                        disabled={statusUpdating === req.id}
                                                        className="px-6 py-2.5 rounded-xl border border-gray-100 text-[10px] font-black text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 uppercase tracking-widest transition-all disabled:opacity-50"
                                                    >
                                                        Decline
                                                    </button>
                                                    <button 
                                                        onClick={() => handleBookingResponse(req.id, 'approved')}
                                                        disabled={statusUpdating === req.id}
                                                        className="px-6 py-2.5 rounded-xl bg-[#0B1A30] text-white text-[10px] font-black hover:bg-gray-800 uppercase tracking-widest shadow-lg shadow-[#0B1A30]/10 transition-all disabled:opacity-50"
                                                    >
                                                        Approve Request
                                                    </button>
                                                </>
                                            )}
                                            {req.status === 'approved' && (
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Deadline</p>
                                                        <p className="text-xs font-black text-[#0B1A30]">{getTimeRemaining(req.approvedAt)}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleConfirmPayment(req.id)}
                                                        disabled={statusUpdating === req.id}
                                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all disabled:opacity-50"
                                                    >
                                                        Confirm Payment
                                                    </button>
                                                </div>
                                            )}
                                            {req.status === 'confirmed' && (
                                                <button 
                                                    onClick={() => navigate('/dashboard/owner', { state: { activeTab: 'stays' } })}
                                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all"
                                                >
                                                    Manage Stay
                                                </button>
                                            )}
                                            {req.status === 'rejected' && req.rejectionReason && (
                                                <p className="text-[10px] text-red-400 italic">Reason: {req.rejectionReason}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'stays' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Active Tenants</h2>
                        <p className="text-gray-500 mt-1 font-medium">Overview of all students currently staying in your properties</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Tenancies</h3>
                        </div>
                        
                        {loadingBookings ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : bookings.filter(b => ['active_stay', 'approved', 'confirmed'].includes(b.status)).length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiUsers size={32} className="text-gray-200" />
                                </div>
                                <h4 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Active Tenants</h4>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">Once students check into your hostels, their active stay details will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Tenant Name</th>
                                            <th className="px-8 py-5">Property & Room</th>
                                            <th className="px-8 py-5">Stay Period</th>
                                            <th className="px-8 py-5">Monthly Rent</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.filter(b => ['active_stay', 'approved', 'confirmed'].includes(b.status)).map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black">
                                                            {req.student?.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm text-[#0B1A30]">{req.student?.fullName}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{req.student?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-bold text-sm text-[#0B1A30] mb-0.5">{req.hostel?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Room {req.room?.roomNumber || '—'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">
                                                        {new Date(req.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {new Date(req.expectedEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-sm text-[#0B1A30]">PKR {req.monthlyPrice?.toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setSelectedBookingDetails(req)} 
                                                            className="px-4 py-2 rounded-lg bg-gray-50 text-[10px] font-black text-[#0B1A30] border border-gray-100 hover:bg-white transition-all uppercase tracking-widest"
                                                        >
                                                            Details
                                                        </button>
                                                        {req.status === 'active_stay' && (
                                                            <button 
                                                                onClick={() => handleCheckout(req.id)}
                                                                disabled={statusUpdating === req.id}
                                                                className="px-4 py-2 rounded-lg bg-red-50 text-[10px] font-black text-red-600 border border-red-100 hover:bg-red-100 transition-all uppercase tracking-widest disabled:opacity-50"
                                                            >
                                                                Checkout
                                                            </button>
                                                        )}
                                                        {req.status === 'confirmed' && (
                                                            <button 
                                                                onClick={() => handleConfirmMoveIn(req.id)}
                                                                disabled={statusUpdating === req.id}
                                                                className="px-4 py-2 rounded-lg bg-emerald-500 text-[10px] font-black text-white hover:bg-emerald-600 transition-all uppercase tracking-widest disabled:opacity-50"
                                                            >
                                                                Confirm Move-in
                                                            </button>
                                                        )}
                                                        {req.status === 'approved' && (
                                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest px-4 py-2 bg-amber-50 rounded-lg">Awaiting Payment</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'earnings' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Earnings & Payouts</h2>
                        <p className="text-gray-500 mt-1 font-medium">Track your platform bookings revenue, commissions and net payout shares</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard 
                            label="Gross Revenue" 
                            value={earnings.totalRevenue?.toLocaleString()} 
                            prefix="PKR"
                            badge="Total Inflow" 
                            badgeColor="text-primary-600 bg-primary-50" 
                            borderClass="border-primary-500" 
                        />
                        <StatCard 
                            label="Net Payouts" 
                            value={earnings.netPayout?.toLocaleString()} 
                            prefix="PKR"
                            badge="Owner Share" 
                            badgeColor="text-emerald-600 bg-emerald-50" 
                            borderClass="border-emerald-500" 
                        />
                        <StatCard 
                            label="Platform Fees" 
                            value={earnings.platformFees?.toLocaleString()} 
                            prefix="PKR"
                            badge="Commission" 
                            badgeColor="text-amber-600 bg-amber-50" 
                            borderClass="border-amber-500" 
                        />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">Payments Ledger</h3>
                            <span className="text-[10px] font-black text-[#0B1A30] bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                                {earnings.totalTransactions} Completed Settlements
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            {loadingEarnings ? (
                                <div className="p-20 text-center text-gray-400">
                                    <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Accessing Ledger Balance...</p>
                                </div>
                            ) : earnings.recentTransactions?.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiDollarSign size={32} className="text-gray-200" />
                                    </div>
                                    <h4 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Settlements Recorded</h4>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">Financial logs and payout transactions will appear here once tenant payments are confirmed.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Tenant</th>
                                            <th className="px-8 py-5">Property</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Reference</th>
                                            <th className="px-8 py-5">Rent Inflow</th>
                                            <th className="px-8 py-5 text-right">Net Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {earnings.recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5 font-bold text-[#0B1A30] text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-black">
                                                            {tx.student?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#0B1A30] text-sm">{tx.student}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-[#0B1A30] font-bold text-xs">{tx.hostel}</p>
                                                </td>
                                                <td className="px-8 py-5 text-gray-500 text-xs">
                                                    {tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-mono text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-md border border-gray-100 font-bold uppercase tracking-wider">{tx.reference}</span>
                                                </td>
                                                <td className="px-8 py-5 text-gray-500 text-xs font-medium">
                                                    PKR {tx.amount?.toLocaleString()} <span className="text-[9px] text-gray-400">(-{tx.fee?.toLocaleString()})</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-emerald-600 text-sm">
                                                    PKR {tx.payout?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Analytics & Reports</h2>
                        <p className="text-gray-500 mt-1 font-medium">Insights and performance of your properties</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            label="Total Requests" 
                            value={bookings?.length || 0}
                            badge="All Time" badgeColor="bg-blue-100 text-blue-700"
                            borderClass="border-blue-500"
                        />
                        <StatCard 
                            label="Active Tenants" 
                            value={activeStays?.length || 0}
                            badge="Current" badgeColor="bg-emerald-100 text-emerald-700"
                            borderClass="border-emerald-500"
                        />
                        <StatCard 
                            label="Total Revenue" 
                            value={(earnings?.totalRevenue || 0).toLocaleString()}
                            prefix="PKR"
                            badge="All Time" badgeColor="bg-amber-100 text-amber-700"
                            borderClass="border-amber-500"
                        />
                        <StatCard 
                            label="Platform Fees" 
                            value={(earnings?.platformFees || 0).toLocaleString()}
                            prefix="PKR"
                            badge="Deducted" badgeColor="bg-red-100 text-red-700"
                            borderClass="border-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Booking Status Breakdown */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-6">Booking Conversion</h3>
                            <div className="space-y-4">
                                {['pending', 'approved', 'confirmed', 'cancelled', 'rejected'].map(status => {
                                    const count = bookings?.filter(b => b.status === status).length || 0;
                                    const percentage = bookings?.length ? Math.round((count / bookings.length) * 100) : 0;
                                    const colors = {
                                        pending: 'bg-amber-500', approved: 'bg-blue-500', confirmed: 'bg-emerald-500', 
                                        cancelled: 'bg-gray-400', rejected: 'bg-red-500'
                                    };
                                    return (
                                        <div key={status}>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{status}</span>
                                                <span className="text-sm font-bold text-[#0B1A30]">{count} <span className="text-xs text-gray-400 font-medium ml-1">({percentage}%)</span></span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${colors[status]}`} style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Payouts Summary */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-6">Settlement Overview</h3>
                            {loadingEarnings ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Net Processed</span>
                                        <span className="text-xl font-black text-emerald-600">PKR {(earnings?.netPayout || 0).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Transactions</p>
                                    <div className="space-y-3">
                                        {earnings?.recentTransactions?.slice(0, 3).map((tx, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0">
                                                <div>
                                                    <p className="font-bold text-[#0B1A30]">{tx.student}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{tx.date ? new Date(tx.date).toLocaleDateString('en-GB') : 'N/A'}</p>
                                                </div>
                                                <span className="font-black text-emerald-500">+ PKR {tx.payout?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tenant Details Modal */}
            {selectedBookingDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedBookingDetails(null)}
                        className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-black">
                                        {selectedBookingDetails.student?.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter">{selectedBookingDetails.student?.fullName}</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active Tenant</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedBookingDetails(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <FiX size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Stay Duration</p>
                                        <p className="text-sm font-bold text-[#0B1A30]">{selectedBookingDetails.durationMonths} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Monthly Rent</p>
                                        <p className="text-sm font-bold text-[#0B1A30]">PKR {selectedBookingDetails.monthlyPrice?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Move-in Date</p>
                                        <p className="text-sm font-bold text-[#0B1A30]">{new Date(selectedBookingDetails.moveInDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">End Date</p>
                                        <p className="text-sm font-bold text-[#0B1A30]">{new Date(selectedBookingDetails.expectedEndDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Contact Information</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium flex justify-between"><span>Email:</span> <span className="text-[#0B1A30]">{selectedBookingDetails.student?.email}</span></p>
                                        <p className="text-sm font-medium flex justify-between"><span>Phone:</span> <span className="text-[#0B1A30]">{selectedBookingDetails.student?.phone || 'N/A'}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button onClick={() => setSelectedBookingDetails(null)} className="w-full bg-[#0B1A30]">Close Details</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Messages</h2>
                        <p className="text-gray-500 mt-1 font-medium">Communicate with students who inquired about your hostels</p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex overflow-hidden min-h-[600px]">
                        {/* Conversation List */}
                        <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-white">
                                <h3 className="font-black text-[#0B1A30] uppercase tracking-tighter">Inbox</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {loadingConversations ? (
                                    <div className="p-8 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">Loading...</div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm font-medium">No messages yet</div>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => { setSelectedConversation(conv); fetchChatMessages(conv.id); }}
                                            className={`p-6 border-b border-gray-100 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-black text-[#0B1A30] text-sm">{conv.student?.fullName || 'Student'}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">{conv.hostel?.name || 'General Inquiry'}</p>
                                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">{conv.lastMessagePreview || 'No messages yet'}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="w-2/3 flex flex-col bg-white">
                            {selectedConversation ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 bg-white shadow-sm z-10">
                                        <h3 className="font-black text-[#0B1A30] text-lg">{selectedConversation.student?.fullName}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{selectedConversation.hostel?.name || 'General Inquiry'} • {selectedConversation.student?.email}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                        {chatMessages.map(msg => {
                                            const isMe = msg.senderRole === 'owner';
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-[#0B1A30] text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className="text-[9px] mt-2 font-bold text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-white">
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Reply to student..."
                                                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-full outline-none focus:border-primary-300 transition-colors text-sm"
                                            />
                                            <Button onClick={handleSendMessage} className="bg-[#0B1A30] rounded-full px-8">Send</Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <FiMessageSquare size={48} className="mb-4 opacity-20" />
                                    <p className="font-black uppercase tracking-widest text-xs">Select a conversation</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
