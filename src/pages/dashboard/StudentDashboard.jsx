import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiCompass, FiCalendar, FiBriefcase, FiMessageSquare, FiBookmark, FiMessageCircle, FiFileText, FiTool, FiMapPin, FiArrowRight, FiHome } from 'react-icons/fi';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { STUDENT_TABS } from '../../constants/tabs';
import MyBookings from './student/MyBookings';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import HostelCard from '../../components/ui/HostelCard';

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

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const firstName = user?.fullName?.split(' ')[0] || 'Student';
    const [bookings, setBookings] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingFavorites, setLoadingFavorites] = useState(true);

    // New States for Messages Tab
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        api.get('/bookings/my')
            .then(res => setBookings(res.data?.data || []))
            .catch(() => setBookings([]))
            .finally(() => setLoadingBookings(false));

        api.get('/student/favorites')
            .then(res => {
                const fetchedFavorites = res.data?.data || res.data || [];
                setFavorites(Array.isArray(fetchedFavorites) ? fetchedFavorites : []);
            })
            .catch(() => setFavorites([]))
            .finally(() => setLoadingFavorites(false));
    }, []);

    useEffect(() => {
        if (activeTab === 'messages') {
            fetchConversations();
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

    const fetchMessages = async (conversationId) => {
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
                recipientId: selectedConversation.ownerId, // null for admin
                hostelId: selectedConversation.hostelId,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages(selectedConversation.id);
            fetchConversations();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const pendingBookings = safeBookings.filter(b => b?.status === 'pending').length;
    const activeStay = safeBookings.find(b => ['active_stay', 'approved', 'confirmed'].includes(b?.status));

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

    const handlePayNow = async (bookingId) => {
        try {
            toast.loading('Preparing secure payment...', { id: 'payment' });
            const response = await api.post(`/payments/initiate/${bookingId}`);
            const { url, params } = response.data;
            
            // Create a temporary form and submit it to redirect to PayFast
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


    return (
        <DashboardLayout tabs={STUDENT_TABS} activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    {/* Welcome Header */}
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Welcome Back, {firstName}!</h2>
                        <p className="text-gray-500 mt-1 font-medium">Your next rent payment is due in 5 days.</p>
                    </div>

                    {/* Unified Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard
                            label="Total Bookings"
                            value={loadingBookings ? '...' : safeBookings.length}
                            badge={pendingBookings > 0 ? `${pendingBookings} Pending` : 'All Done'}
                            badgeColor="text-primary-600 bg-primary-50"
                            borderClass="border-[#0B1A30]"
                        />
                        <StatCard
                            label="Active Stay"
                            value={activeStay ? '01' : '00'}
                            badge={activeStay ? 'LIVE' : 'None'}
                            badgeColor={activeStay ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'}
                            borderClass={activeStay ? 'border-emerald-500' : 'border-gray-200'}
                        />
                        <StatCard
                            label="Approved"
                            value={loadingBookings ? '...' : safeBookings.filter(b => ['approved','confirmed','active_stay','completed'].includes(b?.status)).length}
                            badge="✓ Approved"
                            badgeColor="text-amber-600 bg-amber-50"
                            borderClass="border-amber-400"
                        />
                        <StatCard
                            label="Saved Hostels"
                            value={loadingFavorites ? '...' : favorites.length}
                            badge="🔖 Saved"
                            badgeColor="text-purple-600 bg-purple-50"
                            borderClass="border-[#0B1A30]"
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
                        {/* Main Column */}
                        <div className="flex-1 space-y-6 lg:space-y-8 min-w-0">
                            
                            {/* Redesigned Compact Current Residence Card */}
                            {activeStay ? (
                                <div className="bg-[#0B1A30] rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl group border border-white/5">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
                                    
                                    <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                            <img src={activeStay?.hostel?.images?.[0]?.imageUrl || activeStay?.hostel?.images?.[0]?.url || activeStay?.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=300'} alt="Hostel" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                                <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                                    {activeStay?.status === 'active_stay' ? 'Active Tenancy' : 'Booking Approved'}
                                                </span>
                                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Verified ✓</span>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tighter">{activeStay?.hostel?.name || 'My Hostel'}</h3>
                                            <p className="text-gray-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
                                                <FiMapPin className="text-primary-500" size={14}/> {activeStay?.hostel?.area || 'Area'}, {activeStay?.hostel?.city || 'City'} • Room {activeStay?.room?.roomNumber || '—'}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-3">
                                                <button 
                                                    onClick={() => handlePayNow(activeStay.id)}
                                                    className="px-6 py-2.5 bg-white text-[#0B1A30] font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={activeStay.status === 'confirmed' || activeStay.status === 'active_stay'}
                                                >
                                                    {activeStay.status === 'approved' ? 'Pay to Confirm' : activeStay.status === 'confirmed' ? 'Paid' : 'Pay Rent'}
                                                </button>
                                                <button className="px-6 py-2.5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 group/btn">
                                                    <FiMessageCircle className="group-hover/btn:rotate-12 transition-transform" size={16} /> Support
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="hidden lg:flex flex-col items-end gap-2 text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Since</p>
                                            <div className="text-2xl font-black text-white">
                                                {formatDate(activeStay?.moveInDate, { month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2rem] p-8 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <FiHome className="text-gray-200" size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter">No Active Stay</h3>
                                    <p className="text-gray-400 text-xs font-medium max-w-xs mt-1">Once your booking is approved and you move in, your tenancy details will appear here.</p>
                                    <Link to="/listings" className="mt-4 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Find a Hostel →</Link>
                                </div>
                            )}

                            {/* Booking History Table - Real Data */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-gray-50/20">
                                    <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">Recent Bookings</h3>
                                    <button onClick={() => setActiveTab('bookings')} className="text-[10px] font-black text-primary-600 uppercase tracking-widest">View All</button>
                                </div>
                                <div>
                                    {loadingBookings ? (
                                        <div className="p-8 text-center text-gray-400">
                                            <div className="animate-spin w-6 h-6 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-2" />
                                        </div>
                                    ) : safeBookings.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <FiCalendar size={30} className="mx-auto mb-3 text-gray-200" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No bookings yet</p>
                                            <Link to="/listings" className="inline-block mt-3 text-xs text-primary-600 font-bold">Browse Hostels →</Link>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full text-left min-w-[500px]">
                                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                                        <tr>
                                                            <th className="px-6 py-4">Hostel</th>
                                                            <th className="px-6 py-4">Move-in</th>
                                                            <th className="px-6 py-4">Amount</th>
                                                            <th className="px-6 py-4 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {safeBookings.slice(0, 5).map((b) => {
                                                            if (!b) return null;
                                                            const statusColors = {
                                                                pending:    'text-amber-600 bg-amber-50',
                                                                approved:   'text-blue-600 bg-blue-50',
                                                                confirmed:  'text-emerald-600 bg-emerald-50',
                                                                active_stay:'text-emerald-600 bg-emerald-50',
                                                                rejected:   'text-red-500 bg-red-50',
                                                                cancelled:  'text-gray-400 bg-gray-50',
                                                                completed:  'text-gray-500 bg-gray-50',
                                                            };
                                                            const coverImg = b.hostel?.images?.[0]?.imageUrl || b.hostel?.images?.[0]?.url || b.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80';
                                                            return (
                                                                <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <img src={coverImg} alt="" className="w-10 h-10 rounded-xl object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80'; }} />
                                                                            <div>
                                                                                <p className="font-bold text-[#0B1A30] text-sm leading-tight">{b.hostel?.name || 'Hostel'}</p>
                                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{b.room?.roomType || ''} Room</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-bold text-gray-500 text-xs">
                                                                        {formatDate(b?.moveInDate, { day:'numeric', month:'short', year:'numeric' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-black text-[#0B1A30] text-xs">PKR {b.monthlyPrice?.toLocaleString() || '0'}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[b.status] || 'text-gray-400 bg-gray-50'}`}>
                                                                            {b.status?.replace('_', ' ') || 'unknown'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden divide-y divide-gray-100">
                                                {safeBookings.slice(0, 5).map((b) => {
                                                    const statusColors = {
                                                        pending:    'text-amber-600 bg-amber-50',
                                                        approved:   'text-blue-600 bg-blue-50',
                                                        confirmed:  'text-emerald-600 bg-emerald-50',
                                                        active_stay:'text-emerald-600 bg-emerald-50',
                                                        rejected:   'text-red-500 bg-red-50',
                                                        cancelled:  'text-gray-400 bg-gray-50',
                                                        completed:  'text-gray-500 bg-gray-50',
                                                    };
                                                    const coverImg = b.hostel?.images?.[0]?.imageUrl || b.hostel?.images?.[0]?.url || b.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80';
                                                    return (
                                                        <div key={b.id} className="p-4 space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <img src={coverImg} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-[#0B1A30] text-sm">{b.hostel?.name}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{b.room?.roomType} Room</p>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${statusColors[b.status] || 'text-gray-400 bg-gray-50'}`}>
                                                                    {b.status?.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Move-in Date</p>
                                                                    <p className="text-xs font-bold text-gray-700">{formatDate(b.moveInDate, { day: 'numeric', month: 'short' })}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Monthly</p>
                                                                    <p className="text-xs font-black text-[#0B1A30]">PKR {b.monthlyPrice?.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-full xl:w-80 shrink-0 space-y-6 lg:space-y-8">
                            
                            {/* Notifications Panel */}
                            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100">
                                <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter mb-8">Notifications</h3>
                                <div className="space-y-6">
                                    {[
                                        { icon: FiFileText, color: 'text-blue-500 bg-blue-50', title: 'Invoice Ready', desc: 'March rent invoice generated.', time: '2h ago', unread: true },
                                        { icon: FiTool, color: 'text-amber-500 bg-amber-50', title: 'Maintenance', desc: 'AC servicing scheduled.', time: '5h ago', unread: true },
                                    ].map((n, i) => (
                                        <div key={i} className={`flex gap-4 p-4 rounded-2xl transition-all border ${n.unread ? 'bg-gray-50 border-gray-100 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${n.color}`}><n.icon size={18} /></div>
                                            <div className="min-w-0">
                                                <p className="font-black text-[13px] text-[#0B1A30] truncate tracking-tight">{n.title}</p>
                                                <p className="text-[11px] text-gray-400 font-medium truncate">{n.desc}</p>
                                                <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-3 rounded-xl border border-gray-100 text-[#0B1A30] text-[10px] font-black hover:bg-gray-50 transition-all uppercase tracking-[0.2em]">View History</button>
                            </div>

                            {/* Rewards Section */}
                            <div className="bg-[#F8F9FA] rounded-[2rem] p-8 border border-gray-100 relative overflow-hidden group">
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-all duration-1000"></div>
                                <h3 className="text-sm font-black text-[#0B1A30] mb-2 uppercase tracking-tighter">Tenant Perks</h3>
                                <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium">Get <span className="text-[#0B1A30] font-black">15% discount</span> at partner cafes in Lahore.</p>
                                <button className="text-[9px] font-black text-[#0B1A30] flex items-center gap-2 uppercase tracking-[0.2em] border-b border-[#0B1A30]/10 pb-1">Claim Now →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'bookings' && <MyBookings noLayout={true} />}

            {activeTab === 'active_stay' && (
                <div className="animate-fade-in space-y-8 pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Active Tenancy</h2>
                        <p className="text-gray-500 mt-1 font-medium">Full details of your current residence at Roomzy</p>
                    </div>

                    {activeStay ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-1 shadow-sm border border-gray-100 overflow-hidden relative group">
                                    <div className="aspect-[21/9] w-full overflow-hidden">
                                        <img 
                                            src={activeStay.hostel?.images?.[0]?.imageUrl || activeStay.hostel?.images?.[0]?.url || activeStay.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200'} 
                                            alt="Hostel" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/20 to-transparent" />
                                    </div>
                                    <div className="p-8 relative -mt-32">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                                {activeStay.status === 'active_stay' ? 'Currently Staying' : 'Move-in Confirmed'}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verified Property ✓</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{activeStay.hostel?.name}</h3>
                                        <p className="text-gray-300 font-medium flex items-center gap-2 mb-8">
                                            <FiMapPin className="text-primary-400" size={16}/> {activeStay.hostel?.fullAddress || `${activeStay.hostel?.area}, ${activeStay.hostel?.city}`}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Room Details</p>
                                                <p className="text-lg font-black text-white">Room {activeStay.room?.roomNumber || '—'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{activeStay.room?.roomType} Selection</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Move-in Date</p>
                                                <p className="text-lg font-black text-white">{formatDate(activeStay.moveInDate, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Requested Date</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 col-span-2 sm:col-span-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                                                <p className="text-lg font-black text-white">PKR {activeStay.monthlyPrice?.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Incl. Maintenance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Hostel Features</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['High-Speed Wi-Fi', '24/7 Security', 'Meal Service', 'Power Backup'].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                <span className="text-[10px] font-bold text-[#0B1A30] uppercase tracking-widest">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {['confirmed', 'active_stay'].includes(activeStay.status) ? (
                                        <Button className="w-full mt-8 bg-[#0B1A30] hover:bg-gray-800 py-4 shadow-xl shadow-[#0B1A30]/10">
                                            Contact Warden
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full mt-8 bg-gray-200 text-gray-500 py-4 cursor-not-allowed border-none">
                                            Payment Required to Contact Warden
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <FiHome size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Active Residency</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto">Once your booking is approved and you move in, your tenancy details will appear here.</p>
                            <Link to="/listings" className="inline-block mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-600 pb-1">Browse Hostels →</Link>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="animate-fade-in space-y-8 pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Saved Hostels</h2>
                        <p className="text-gray-500 mt-1 font-medium">Your personal wishlist of verified hostels</p>
                    </div>

                    {loadingFavorites ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-[#0B1A30] border-t-transparent rounded-full mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Wishlist...</p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <FiBookmark size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">Wishlist is Empty</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto">Save hostels you like to compare them later or book them when you're ready.</p>
                            <Link to="/listings" className="inline-block mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-600 pb-1">Start Browsing →</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((hostel, index) => (
                                <HostelCard key={hostel.id} hostel={{ ...hostel, isSaved: true }} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Messages</h2>
                        <p className="text-gray-500 mt-1 font-medium">Communicate with Hostel Owners and Roomzy Support</p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex overflow-hidden min-h-[600px]">
                        {/* List Sidebar */}
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
                                    conversations.map(conv => {
                                        const isSupport = conv.ownerId === null;
                                        const title = isSupport ? 'Roomzy Support' : (conv.owner?.fullName || 'Hostel Owner');
                                        return (
                                            <div 
                                                key={conv.id}
                                                onClick={() => { setSelectedConversation(conv); fetchMessages(conv.id); }}
                                                className={`p-6 border-b border-gray-100 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-[#0B1A30] text-sm flex items-center gap-2">
                                                        {isSupport && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                                        {title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">{conv.lastMessagePreview || 'No messages yet'}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="w-2/3 flex flex-col bg-white">
                            {selectedConversation ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                                        <div>
                                            <h3 className="font-black text-[#0B1A30] text-lg">
                                                {selectedConversation.ownerId === null ? 'Roomzy Support' : selectedConversation.owner?.fullName}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {selectedConversation.ownerId === null ? 'Official Platform Support' : selectedConversation.hostel?.name || 'Owner'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                        {chatMessages.map(msg => {
                                            const isMe = msg.senderId === user?.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-[#0B1A30] text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className={`text-[9px] mt-2 font-bold ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                                        </p>
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
                                                placeholder="Type your message..." 
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

            {activeTab === 'browse' && (
                <div className="flex flex-col items-center justify-center h-full p-20 text-gray-400 animate-fade-in">
                    <FiCompass size={40} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.2em] text-[9px] mb-4">Browse Listings</p>
                    <Link to="/listings" className="px-6 py-3 bg-[#0B1A30] text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-colors">
                        Open Listings →
                    </Link>
                </div>
            )}

            {!['dashboard', 'bookings', 'browse', 'active_stay', 'saved', 'messages'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full p-20 text-gray-400 animate-fade-in">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                        <FiGrid size={24} className="opacity-20" />
                    </div>
                    <p className="font-black uppercase tracking-[0.2em] text-[9px]">Coming Soon — <span className="text-[#0B1A30]">{activeTab.replace('_', ' ')}</span></p>
                </div>
            )}
        </DashboardLayout>
    );
}
