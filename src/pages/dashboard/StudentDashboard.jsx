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

// â”€â”€â”€ Unified Professional Stat Card Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            
            if (location.state.activeTab === 'messages' && location.state.initialMessage) {
                setNewMessage(location.state.initialMessage);
            }
            
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
            const data = response.data?.data || [];
            setConversations(data);
            
            // Auto-select conversation if we have a targetOwnerId from state
            if (location.state?.targetOwnerId) {
                const existingConv = data.find(c => c.ownerId === location.state.targetOwnerId);
                if (existingConv) {
                    setSelectedConversation(existingConv);
                    fetchMessages(existingConv.id);
                } else {
                    // Start a temporary conversation object if not found
                    setSelectedConversation({
                        id: 'new',
                        ownerId: location.state.targetOwnerId,
                        owner: { fullName: 'Hostel Owner' },
                        hostel: { name: location.state.hostelName || 'Hostel' }
                    });
                    setChatMessages([]);
                }
            }
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
            const payload = {
                recipientId: selectedConversation.ownerId,
                content: newMessage
            };
            
            // If it's a new conversation, we don't have conversationId yet
            if (selectedConversation.id !== 'new') {
                payload.conversationId = selectedConversation.id;
            }

            await api.post('/chat/direct', payload);
            setNewMessage('');
            
            if (selectedConversation.id === 'new') {
                // Refresh everything to get the real conversation ID
                fetchConversations();
            } else {
                fetchMessages(selectedConversation.id);
                fetchConversations();
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const pendingBookings = safeBookings.filter(b => b?.status === 'pending').length;
    const activeStay = safeBookings.find(b => ['active_stay', 'approved', 'confirmed'].includes(b?.status));

    const formatDate = (dateStr, options) => {
        if (!dateStr) return 'â€”';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'â€”';
        try {
            return date.toLocaleDateString('en-GB', options);
        } catch (e) {
            return 'â€”';
        }
    };

    const handlePayNow = async (bookingId) => {
        toast.info('Please contact the owner directly for physical payment. Once paid, they will confirm your booking.');
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

                    {/* Unified Stats Grid â€” 4 Cards matching Owner/Admin layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard
                            label="Total Bookings"
                            value={loadingBookings ? '...' : safeBookings.length}
                            badge="All Time"
                            badgeColor="text-blue-600 bg-blue-50"
                            borderClass="border-[#0B1A30]"
                        />
                        <StatCard
                            label="Pending Requests"
                            value={loadingBookings ? '...' : pendingBookings}
                            badge={pendingBookings > 0 ? 'â³ Awaiting' : 'None'}
                            badgeColor="text-amber-600 bg-amber-50"
                            borderClass="border-amber-400"
                        />
                        <StatCard
                            label="Approved / Active"
                            value={loadingBookings ? '...' : safeBookings.filter(b => ['approved','confirmed','active_stay','completed'].includes(b?.status)).length}
                            badge="âœ“ Approved"
                            badgeColor="text-emerald-600 bg-emerald-50"
                            borderClass="border-emerald-400"
                        />
                        <StatCard
                            label="Saved Hostels"
                            value={loadingFavorites ? '...' : favorites.length}
                            badge="ðŸ”– Saved"
                            badgeColor="text-purple-600 bg-purple-50"
                            borderClass="border-purple-400"
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
                        {/* Main Column */}
                        <div className="flex-1 space-y-6 lg:space-y-8 min-w-0">
                            


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
                                            <Link to="/listings" className="inline-block mt-3 text-xs text-primary-600 font-bold">Browse Hostels â†’</Link>
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


                    </div>
                </div>
            )}
            
            {activeTab === 'bookings' && <MyBookings noLayout={true} />}

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
                            <Link to="/listings" className="inline-block mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-600 pb-1">Start Browsing â†’</Link>
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

            {activeTab === 'active_stay' && (
                <div className="space-y-6 animate-fade-in pb-8">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Active Stay</h2>
                            <p className="text-gray-500 mt-1 font-medium">Your current confirmed accommodation</p>
                        </div>
                        {activeStay && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {activeStay.status === 'active_stay' ? 'Currently Living Here' : activeStay.status === 'confirmed' ? 'Confirmed Booking' : 'Approved'}
                            </span>
                        )}
                    </div>

                    {loadingBookings ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="animate-spin w-10 h-10 border-4 border-[#0B1A30] border-t-transparent rounded-full" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading stay details...</p>
                        </div>
                    ) : activeStay ? (
                        <div className="space-y-5">
                            {/* Hero Card */}
                            <div className="relative rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 group">
                                <div className="relative h-56 sm:h-72 w-full">
                                    <img
                                        src={activeStay.hostel?.images?.[0]?.imageUrl || activeStay.hostel?.images?.[0]?.url || activeStay.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80'}
                                        alt={activeStay.hostel?.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/30 to-transparent" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-[900] text-white tracking-tight leading-tight">{activeStay.hostel?.name}</h3>
                                            <p className="text-white/60 text-sm font-medium mt-1 flex items-center gap-1">
                                                <FiMapPin size={13} />{activeStay.hostel?.area}, {activeStay.hostel?.city}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">Monthly Rent</p>
                                            <p className="text-white text-2xl font-[900]">PKR {activeStay.monthlyPrice?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Room Type', value: activeStay.room?.roomType ? (activeStay.room.roomType.charAt(0).toUpperCase() + activeStay.room.roomType.slice(1)) : '\u2014', bg: 'bg-blue-50', text: 'text-blue-600', icon: <FiHome size={20}/> },
                                    { label: 'Move-in Date', value: formatDate(activeStay.moveInDate, { day: 'numeric', month: 'short', year: 'numeric' }), bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <FiCalendar size={20}/> },
                                    { label: 'Duration', value: `${activeStay.durationMonths} Month${activeStay.durationMonths > 1 ? 's' : ''}`, bg: 'bg-purple-50', text: 'text-purple-600', icon: <FiArrowRight size={20}/> },
                                    { label: 'Monthly Rent', value: `PKR ${activeStay.monthlyPrice?.toLocaleString() || '\u2014'}`, bg: 'bg-amber-50', text: 'text-amber-600', icon: <FiFileText size={20}/> },
                                ].map((item, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className="bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                                        <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.text} flex items-center justify-center`}>{item.icon}</div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em]">{item.label}</p>
                                            <p className="font-[900] text-[#0B1A30] text-base leading-tight mt-0.5">{item.value}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Hostel Details */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hostel Details</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Gender', value: activeStay.hostel?.gender ? (activeStay.hostel.gender.charAt(0).toUpperCase() + activeStay.hostel.gender.slice(1)) : '\u2014' },
                                        { label: 'City', value: activeStay.hostel?.city || '\u2014' },
                                        { label: 'Area / Sector', value: activeStay.hostel?.area || '\u2014' },
                                        { label: 'Booking Date', value: formatDate(activeStay.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.18em] mb-1">{item.label}</p>
                                            <p className="font-[900] text-[#0B1A30] text-sm">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {activeStay.hostel?.amenities && activeStay.hostel.amenities.length > 0 && (
                                    <div className="mt-2 pt-4 border-t border-gray-50">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Amenities Included</p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeStay.hostel.amenities.map((a, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-xl">
                                                    &#10003; {a}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Review / Reviewed Banner */}
                            {!activeStay.hasReview ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    className="relative overflow-hidden rounded-[2rem] shadow-xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0B1A30] via-gray-800 to-primary-900" />
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                                    <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div>
                                            <div className="text-amber-400 text-xl mb-2">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                                            <p className="text-white font-[900] text-xl tracking-tight">How's your stay going?</p>
                                            <p className="text-white/50 text-sm font-medium mt-1">Your honest review helps other students choose safely</p>
                                        </div>
                                        <button onClick={() => setActiveTab('bookings')}
                                            className="shrink-0 px-7 py-3.5 bg-white text-[#0B1A30] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all shadow-xl">
                                            Write a Review
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">&#10003;</div>
                                    <div>
                                        <p className="font-[900] text-emerald-800 text-sm">Review Submitted</p>
                                        <p className="text-emerald-600 text-xs font-medium mt-0.5">Thank you for helping other students!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 py-24 px-8 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <FiBriefcase size={36} className="text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter mb-3">No Active Stay</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                                You don't have a confirmed or active booking right now. Browse verified hostels and secure your accommodation.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                                <Link to="/listings" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0B1A30] text-white text-xs font-black rounded-2xl hover:bg-gray-800 transition-colors shadow-md">
                                    Browse Hostels
                                </Link>
                                <button onClick={() => setActiveTab('bookings')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-100 text-[#0B1A30] text-xs font-black rounded-2xl hover:bg-gray-200 transition-colors">
                                    View My Bookings
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
{activeTab === 'browse' && (
                <div className="flex flex-col items-center justify-center h-full p-20 text-gray-400 animate-fade-in">
                    <FiCompass size={40} className="mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.2em] text-[9px] mb-4">Browse Listings</p>
                    <Link to="/listings" className="px-6 py-3 bg-[#0B1A30] text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-colors">
                        Open Listings â†’
                    </Link>
                </div>
            )}

            {!['dashboard', 'bookings', 'browse', 'active_stay', 'saved', 'messages'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full p-20 text-gray-400 animate-fade-in">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                        <FiGrid size={24} className="opacity-20" />
                    </div>
                    <p className="font-black uppercase tracking-[0.2em] text-[9px]">Coming Soon â€” <span className="text-[#0B1A30]">{activeTab.replace('_', ' ')}</span></p>
                </div>
            )}
        </DashboardLayout>
    );
}
