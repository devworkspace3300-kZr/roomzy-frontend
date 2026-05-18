import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiUsers, FiHome, FiCalendar, FiDollarSign, FiSettings, FiCheckCircle, FiXCircle, FiAlertCircle, FiMoreVertical, FiTrendingUp, FiActivity, FiArrowUpRight, FiPieChart, FiEdit2, FiTrash2, FiSearch, FiShield, FiFileText, FiUser, FiEye, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ADMIN_TABS } from '../../constants/tabs';

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

export default function AdminDashboard() {
    const { user } = useAuth();
    
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        if (typeof dateString === 'string' && (dateString.includes('Invalid') || dateString.includes('NaN'))) return '—';
        try {
            let formattedStr = dateString;
            if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
                formattedStr = dateString.replace(' ', 'T');
            }
            const d = new Date(formattedStr);
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '—';
        }
    };
    const [activeTab, setActiveTab] = useState('dashboard');
    console.log('[AdminDashboard] Component Rendering...', { userRole: user?.role, activeTab });
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pendingHostels, setPendingHostels] = useState([]);
    const [loadingHostels, setLoadingHostels] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [pendingOwners, setPendingOwners] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [selectedOwnerReq, setSelectedOwnerReq] = useState(null);
    const [selectedHostelForReview, setSelectedHostelForReview] = useState(null);
    const [financeStats, setFinanceStats] = useState({ totalRevenue: 0, platformFees: 0, growth: 0, recentTransactions: [] });
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [hostels, setHostels] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingBooking, setUpdatingBooking] = useState(false);
    
    // New States for User Management
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ fullName: '', email: '', phone: '', password: '', role: 'student' });
    const [creatingUser, setCreatingUser] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    
    // New States for Hostel Details
    const [selectedHostelDetails, setSelectedHostelDetails] = useState(null);
    const [isHostelEditModalOpen, setIsHostelEditModalOpen] = useState(false);
    const [hostelSearchTerm, setHostelSearchTerm] = useState('');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [ownerVerificationFilter, setOwnerVerificationFilter] = useState('pending');
    const [hostelVerificationFilter, setHostelVerificationFilter] = useState('pending');
    
    // New States for Support Inbox
    const [supportInquiries, setSupportInquiries] = useState([]);
    const [loadingInquiries, setLoadingInquiries] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [inquiryMessages, setInquiryMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // System Settings States & Handlers
    const [commissionSettings, setCommissionSettings] = useState({ mode: 'percentage', rate: 10.0, fixedFee: 0 });
    const [savingSettings, setSavingSettings] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);

    const fetchCommissionRate = async () => {
        setLoadingSettings(true);
        try {
            const res = await api.get('/admin/settings/commission');
            if (res.data) {
                setCommissionSettings({
                    mode: res.data.mode || 'percentage',
                    rate: res.data.rate || 10.0,
                    fixedFee: res.data.fixedFee || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch commission settings', error);
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleSaveCommissionRate = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await api.patch('/admin/settings/commission', { 
                mode: commissionSettings.mode,
                rate: parseFloat(commissionSettings.rate),
                fixedFee: parseFloat(commissionSettings.fixedFee)
            });
            toast.success('Commission settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update commission rate');
        } finally {
            setSavingSettings(false);
        }
    };

    // Student Reviews States & Handlers
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await api.get('/reviews/admin/all');
            setReviews(res.data?.data || []);
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleApproveReview = async (reviewId) => {
        try {
            await api.patch(`/reviews/${reviewId}/approve`);
            toast.success('Review approved successfully');
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve review');
        }
    };

    const handleRejectReview = async (reviewId) => {
        try {
            await api.patch(`/reviews/${reviewId}/reject`);
            toast.success('Review rejected successfully');
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject review');
        }
    };

    const location = useLocation();

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        console.log(`[AdminDashboard] Active tab changed to: ${activeTab}`);
        switch (activeTab) {
            case 'dashboard': 
                console.log('[AdminDashboard] Fetching overview stats...');
                fetchUsers(); 
                fetchFinanceStats(); 
                fetchHostels(); 
                break;
            case 'users': fetchUsers(); break;
            case 'hostels': fetchPendingHostels(); fetchHostels(); break;
            case 'all_hostels': fetchHostels(); break;
            case 'bookings': fetchBookings(); break;
            case 'verifications': fetchPendingOwners(); break;
            case 'finance': fetchFinanceStats(); break;
            case 'support': fetchSupportInquiries(); break;
            case 'settings': fetchCommissionRate(); break;
            case 'reviews': fetchReviews(); break;
        }
    }, [activeTab, ownerVerificationFilter, hostelVerificationFilter]);

    const fetchSupportInquiries = async () => {
        setLoadingInquiries(true);
        try {
            const response = await api.get('/chat/admin/inquiries');
            setSupportInquiries(response.data?.data || []);
        } catch (error) {
            toast.error('Failed to load support inquiries');
        } finally {
            setLoadingInquiries(false);
        }
    };

    const fetchInquiryMessages = async (conversationId) => {
        try {
            const response = await api.get(`/chat/messages/${conversationId}`);
            setInquiryMessages(response.data?.data || []);
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedInquiry) return;
        try {
            await api.post('/chat/direct', {
                conversationId: selectedInquiry.id,
                recipientId: selectedInquiry.studentId,
                content: newMessage
            });
            setNewMessage('');
            fetchInquiryMessages(selectedInquiry.id);
            fetchSupportInquiries(); // refresh list for preview
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleDeleteAllChats = async () => {
        if (!window.confirm('Are you sure you want to completely delete all chats and messages from the database? This action cannot be undone.')) return;
        
        try {
            await api.delete('/chat/admin/all');
            toast.success('All chats and messages deleted successfully');
            setSupportInquiries([]);
            setSelectedInquiry(null);
            setInquiryMessages([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete all chats');
        }
    };

    const fixCloudinaryUrl = (url) => {
        if (!url) return '';
        // If it's a PDF, we must use the /raw/ endpoint to bypass Cloudinary's image security blocks
        if (url.toLowerCase().endsWith('.pdf') && url.includes('/image/upload/')) {
            return url.replace('/image/upload/', '/raw/upload/');
        }
        return url;
    };

    const fetchPendingHostels = async () => {
        setLoadingHostels(true);
        try {
            const [pendingRes, historyRes] = await Promise.all([
                api.get('/hostels/pending'),
                api.get('/hostels/history')
            ]);
            const pending = pendingRes.data?.data || [];
            const history = historyRes.data?.data || [];
            const combined = [...pending, ...history];
            setPendingHostels(combined);
        } catch (error) {
            toast.error('Failed to load hostels for verification');
        } finally {
            setLoadingHostels(false);
        }
    };

    const handleVerifyHostel = async (id, status) => {
        try {
            await api.patch(`/hostels/${id}/verify`, { status });
            toast.success(`Hostel ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
            setSelectedHostelForReview(null);
            fetchPendingHostels();
        } catch (error) {
            toast.error('Action failed');
        }
    };
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.get('/users');
            const userData = response.data?.data || [];
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users data');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const response = await api.get('/bookings/all');
            const bookingsData = response.data?.data || [];
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking record? This action cannot be undone.')) {
            try {
                await api.delete(`/bookings/${id}`);
                toast.success('Booking deleted successfully');
                fetchBookings();
            } catch (error) {
                toast.error('Failed to delete booking');
            }
        }
    };

    const fetchFinanceStats = async () => {
        setLoadingFinance(true);
        try {
            const response = await api.get('/payments/stats');
            setFinanceStats(response.data?.data || { totalRevenue: 0, platformFees: 0, growth: 0, recentTransactions: [] });
        } catch (error) {
            console.error('Failed to fetch finance stats:', error);
            // Don't show toast error here yet as the endpoint might not exist
        } finally {
            setLoadingFinance(false);
        }
    };

    const fetchHostels = async () => {
        setLoadingHostels(true);
        try {
            const response = await api.get('/hostels/admin/all');
            setHostels(response.data?.data || []);
        } catch (error) {
            toast.error('Failed to load hostels');
        } finally {
            setLoadingHostels(false);
        }
    };

    const handleDeleteHostel = async (id) => {
        if (window.confirm('Delete this hostel? This will remove all associated rooms and images.')) {
            try {
                await api.delete(`/hostels/admin/${id}`);
                toast.success('Hostel deleted');
                fetchHostels();
            } catch (error) {
                toast.error('Failed to delete hostel');
            }
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreatingUser(true);
        try {
            await api.post('/users/admin/create', newUser);
            setCreatedCredentials({ ...newUser });
            toast.success('User created successfully');
            setIsAddUserModalOpen(false);
            setNewUser({ fullName: '', email: '', phone: '', password: '', role: 'student' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        setUpdatingBooking(true);
        try {
            await api.patch(`/bookings/${id}/admin`, { status });
            toast.success('Booking status updated');
            fetchBookings();
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(prev => ({ ...prev, status }));
            }
        } catch (error) {
            toast.error('Failed to update booking');
        } finally {
            setUpdatingBooking(false);
        }
    };

    const fetchPendingOwners = async () => {
        setLoadingOwners(true);
        try {
            const response = await api.get(`/admin/owners/pending?status=${ownerVerificationFilter}`);
            const resData = response.data?.data || response.data || [];
            setPendingOwners(Array.isArray(resData) ? resData : []);
        } catch (error) {
            toast.error('Failed to load owner verification requests');
        } finally {
            setLoadingOwners(false);
        }
    };

    const handleVerifyOwner = async (ownerId) => {
        try {
            await api.patch(`/admin/owners/${ownerId}/verify`);
            toast.success('Owner verified successfully');
            setSelectedOwnerReq(null);
            fetchPendingOwners();
        } catch (error) {
            toast.error('Failed to verify owner');
        }
    };

    const handleRejectOwner = async (ownerId, reason) => {
        if (!reason) {
            toast.error('Please provide a rejection reason');
            return;
        }
        try {
            await api.patch(`/admin/owners/${ownerId}/reject`, { reason });
            toast.success('Owner verification rejected');
            setSelectedOwnerReq(null);
            fetchPendingOwners();
        } catch (error) {
            toast.error('Failed to reject owner');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleUpdateUser = async (userId, data) => {
        try {
            await api.patch(`/users/${userId}`, data);
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleExportUsers = () => {
        if (users.length === 0) return toast.error('No users to export');
        const headers = ['FullName', 'Email', 'Role', 'Status', 'Phone', 'Created At'];
        const rows = users.map(u => [
            u.fullName,
            u.email,
            u.role,
            u.status,
            u.phone || 'N/A',
            new Date(u.createdAt).toLocaleDateString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `roomzy_users_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('User registry exported');
    };

    const handleExportBookings = () => {
        if (bookings.length === 0) return toast.error('No bookings to export');
        const headers = ['ID', 'Student', 'Hostel', 'Room', 'Status', 'Price', 'Date'];
        const rows = bookings.map(b => [
            b.id,
            b.student?.fullName,
            b.hostel?.name,
            b.room?.roomNumber,
            b.status,
            b.monthlyPrice,
            new Date(b.createdAt).toLocaleDateString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `roomzy_bookings_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Booking records exported');
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullName?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                             u.email?.toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredHostels = hostels.filter(h => 
        h.name?.toLowerCase().includes(hostelSearchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(hostelSearchTerm.toLowerCase())
    );

    return (
        <DashboardLayout tabs={ADMIN_TABS} activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">System Overview</h2>
                            <p className="text-gray-500 mt-1 font-medium">Platform analytics & management control</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleExportUsers} size="sm" className="hidden md:flex border-gray-200">Export Analytics</Button>
                        </div>
                    </div>

                    {/* Unified Stats Row - Using Professional Navy Theme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            label="Total Users" 
                            value={users.length} 
                            badge={`+${users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} This Week`} 
                            badgeColor="text-primary-600 bg-primary-50" 
                            borderClass="border-[#0B1A30]" 
                        />
                        <StatCard 
                            label="Active Hostels" 
                            value={hostels.filter(h => h.status === 'verified').length || '0'} 
                            badge={`${hostels.filter(h => h.status === 'pending').length} Pending`} 
                            badgeColor="text-amber-600 bg-amber-50" 
                            borderClass="border-primary-400" 
                        />
                        <StatCard 
                            label="Total Revenue" 
                            value={Number(financeStats?.totalRevenue || 0).toLocaleString()} 
                            prefix="PKR"
                            badge={`${bookings.filter(b => b.status === 'confirmed').length} Paid`} 
                            badgeColor="text-emerald-600 bg-emerald-50" 
                            borderClass="border-emerald-500" 
                        />
                        <StatCard 
                            label="Platform Fee" 
                            value={Number(financeStats?.platformFees || 0).toLocaleString()} 
                            prefix="PKR"
                            badge="10% Cut" 
                            badgeColor="text-primary-600 bg-primary-50" 
                            borderClass="border-primary-500" 
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Graphical Analytics */}
                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-black text-[#0B1A30] flex items-center gap-2 uppercase tracking-tighter">
                                        <FiActivity className="text-primary-600" /> Platform Growth
                                    </h3>
                                    <div className="flex gap-6">
                                        <span className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span className="w-3 h-3 rounded-full bg-[#0B1A30]"></span> Users
                                        </span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span className="w-3 h-3 rounded-full bg-primary-400"></span> Hostels
                                        </span>
                                    </div>
                                </div>
                                <div className="h-64 flex items-end justify-between gap-3 px-2 border-b border-gray-100 pb-2">
                                    {[
                                        { month: 'MAY', u: 40, h: 20 },
                                        { month: 'JUN', u: 55, h: 30 },
                                        { month: 'JUL', u: 45, h: 35 },
                                        { month: 'AUG', u: 65, h: 50 },
                                        { month: 'SEP', u: 75, h: 65 },
                                        { month: 'OCT', u: 90, h: 80 },
                                    ].map((d, i) => (
                                        <div key={i} className="flex flex-col items-center flex-1 group relative">
                                            <div className="w-full flex justify-center gap-1.5 h-48 items-end">
                                                <div className="w-4 bg-[#0B1A30] rounded-t-md transition-all duration-500 group-hover:scale-y-105 origin-bottom opacity-90 group-hover:opacity-100 shadow-sm" style={{ height: `${d.u * 1.5}px` }}></div>
                                                <div className="w-4 bg-primary-400 rounded-t-md transition-all duration-500 group-hover:scale-y-105 origin-bottom opacity-80 group-hover:opacity-100 shadow-sm" style={{ height: `${d.h * 1.5}px` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 mt-5 tracking-widest">{d.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-[#0B1A30] mb-8 uppercase tracking-tighter">Recent System Activity</h3>
                                <div className="space-y-8">
                                    {bookings.slice(0, 3).map((b, i) => (
                                        <div key={i} className="flex items-center gap-5 group cursor-pointer p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <div className={`p-3.5 rounded-2xl shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300 ${
                                                b.status === 'confirmed' ? 'bg-emerald-500 text-white' :
                                                b.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-[#0B1A30] text-white'
                                            }`}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-[#0B1A30] text-sm tracking-tight">
                                                    {b.status === 'confirmed' ? 'Booking Confirmed' : 
                                                     b.status === 'pending' ? 'New Booking Request' : 
                                                     `Booking ${b.status}`}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {b.student?.fullName} {b.status === 'pending' ? 'requested' : 'for'} {b.hostel?.name}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(b.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && (
                                        <div className="text-center py-10 text-gray-400">
                                            <FiActivity size={40} className="mx-auto mb-4 opacity-10" />
                                            <p className="text-xs font-black uppercase tracking-widest">No recent activity detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-8">
                            {/* Acceptance Rate Distribution */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#0B1A30] mb-8 flex items-center gap-2 uppercase tracking-tighter"><FiPieChart className="text-primary-600"/> Platform Metrics</h3>
                                <div className="space-y-8">
                                    {[
                                        { label: 'Student Acceptance', val: 92, color: 'bg-[#0B1A30]' },
                                        { label: 'Hostel Verifications', val: 78, color: 'bg-primary-500' },
                                        { label: 'Owner Approvals', val: 85, color: 'bg-emerald-500' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-[0.15em]">
                                                <span className="text-gray-400">{item.label}</span>
                                                <span className="text-[#0B1A30]">{item.val}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                                                <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* System Alerts */}
                            <div className="bg-[#0B1A30] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-[60px] -mr-10 -mt-10"></div>
                                <h3 className="text-lg font-black mb-6 relative z-10 flex items-center gap-2 uppercase tracking-tighter"><FiAlertCircle className="text-primary-400"/> Critical Health</h3>
                                <div className="space-y-5 relative z-10">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Database System</p>
                                        <p className="text-sm font-bold mt-1.5">Auto-backup scheduled in 2h</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                        <p className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Security Protocol</p>
                                        <p className="text-sm font-bold mt-1.5">3 Unusual login attempts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">User Management</h2>
                            <p className="text-gray-500 mt-1 font-medium">Control platform access and sensitive data</p>
                        </div>
                        <Button 
                            onClick={() => setIsAddUserModalOpen(true)}
                            size="sm" 
                            className="bg-[#0B1A30] hover:bg-gray-800"
                        >
                            Add New User
                        </Button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/30">
                            <div className="relative flex-1 max-w-md group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B1A30] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or email..." 
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#0B1A30]/5 focus:border-[#0B1A30] transition-all" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                    className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#0B1A30] focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="owner">Owners</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <Button variant="outline" onClick={handleExportUsers} size="sm" className="border-gray-200">Export Registry</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">User Profile</th>
                                        <th className="px-8 py-6">Identity Role</th>
                                        <th className="px-8 py-6">Last Access</th>
                                        <th className="px-8 py-6">Auth Status</th>
                                        <th className="px-8 py-6 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingUsers ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Accessing User Registry...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-xs">No Records Found</td></tr>
                                    ) : filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#0B1A30] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                                        {u.profileImageUrl ? (
                                                            <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.fullName?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#0B1A30] tracking-tight">{u.fullName}</p>
                                                        <p className="text-xs text-gray-400 font-bold">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                    u.role === 'admin' ? 'bg-[#0B1A30] text-white' :
                                                    u.role === 'owner' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-[#0B1A30]'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                                                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                                    u.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                                                    {u.status === 'active' ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => { setEditingUser(u); setIsEditModalOpen(true); }}
                                                        className="p-3 text-gray-400 hover:text-[#0B1A30] hover:bg-[#0B1A30]/5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add User Modal */}
                    <AnimatePresence>
                        {isAddUserModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setIsAddUserModalOpen(false)}
                                    className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                                >
                                    <form onSubmit={handleCreateUser} className="p-8">
                                        <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-6">Create New Account</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Full Name</label>
                                                <input required type="text" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Email Address</label>
                                                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Role</label>
                                                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all">
                                                        <option value="student">Student</option>
                                                        <option value="owner">Owner</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Phone</label>
                                                    <input required type="text" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Initial Password</label>
                                                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="e.g. Roomzy@123" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-3">
                                            <Button type="button" variant="outline" onClick={() => setIsAddUserModalOpen(false)} className="flex-1">Cancel</Button>
                                            <Button type="submit" disabled={creatingUser} className="flex-1 bg-[#0B1A30]">
                                                {creatingUser ? 'Creating...' : 'Create Account'}
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Edit User Modal */}
                    <AnimatePresence>
                        {isEditModalOpen && editingUser && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                                >
                                    <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(editingUser.id, editingUser); }} className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter">Edit User Profile</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase ${editingUser.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {editingUser.status === 'active' ? 'Active' : 'Deactivated'}
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditingUser({...editingUser, status: editingUser.status === 'active' ? 'suspended' : 'active'})}
                                                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${editingUser.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${editingUser.status === 'active' ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Full Name</label>
                                                <input type="text" value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Phone Number</label>
                                                <input type="text" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Email Address (Read Only)</label>
                                                <input disabled type="email" value={editingUser.email} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed" />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-3">
                                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">Cancel</Button>
                                            <Button type="submit" className="flex-1 bg-[#0B1A30]">Save Changes</Button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === 'all_hostels' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">All Hostels</h2>
                            <p className="text-gray-500 mt-1 font-medium">Manage and monitor all property listings on the platform</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                            <div className="relative max-w-md group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B1A30] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search hostels by name or city..." 
                                    value={hostelSearchTerm}
                                    onChange={(e) => setHostelSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#0B1A30]/5 focus:border-[#0B1A30] transition-all" 
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {loadingHostels ? (
                                <div className="p-20 text-center">
                                    <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
                                </div>
                            ) : hostels.length === 0 ? (
                                <div className="p-20 text-center text-gray-400">No hostels found.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Hostel</th>
                                            <th className="px-8 py-5">Owner</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Location</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredHostels.map((h) => (
                                            <tr key={h.id} className="hover:bg-gray-50/30 transition-colors group cursor-pointer" onClick={() => { setSelectedHostelDetails(h); setIsHostelEditModalOpen(false); }}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={h.images?.[0]?.imageUrl || h.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=100'} 
                                                            alt="" 
                                                            className="w-10 h-10 rounded-xl object-cover" 
                                                        />
                                                        <div>
                                                            <p className="font-bold text-[#0B1A30] text-sm group-hover:text-primary-600 transition-colors">{h.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{h.genderType} Hostel</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-medium text-gray-600">{h.owner?.fullName || 'Unknown'}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        h.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                                        h.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-xs text-gray-500 font-medium">{h.area}, {h.city}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                        <button 
                                                            onClick={() => { setSelectedHostelDetails(h); setIsHostelEditModalOpen(true); }}
                                                            className="p-2 text-gray-400 hover:text-[#0B1A30] hover:bg-gray-100 rounded-xl transition-all"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteHostel(h.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
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

            {activeTab === 'hostels' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Hostel Verifications</h2>
                            <p className="text-gray-500 mt-1 font-medium">Review and approve property listings</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['pending', 'approved', 'rejected', 'all'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setHostelVerificationFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${hostelVerificationFilter === s ? 'bg-[#0B1A30] text-white border-[#0B1A30]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Hostel Details</th>
                                        <th className="px-8 py-6">Owner</th>
                                        <th className="px-8 py-6">Location</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingHostels ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Accessing Submissions...</td></tr>
                                    ) : pendingHostels.filter(h => {
                                        if (hostelVerificationFilter === 'all') return true;
                                        if (hostelVerificationFilter === 'pending') return ['submitted', 'documents_pending', 'inspection_scheduled', 'under_review'].includes(h.status);
                                        if (hostelVerificationFilter === 'approved') return h.status === 'verified';
                                        if (hostelVerificationFilter === 'rejected') return h.status === 'rejected';
                                        return true;
                                    }).length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-xs">No Requests Found ({hostelVerificationFilter})</td></tr>
                                    ) : pendingHostels.filter(h => {
                                        if (hostelVerificationFilter === 'all') return true;
                                        if (hostelVerificationFilter === 'pending') return ['submitted', 'documents_pending', 'inspection_scheduled', 'under_review'].includes(h.status);
                                        if (hostelVerificationFilter === 'approved') return h.status === 'verified';
                                        if (hostelVerificationFilter === 'rejected') return h.status === 'rejected';
                                        return true;
                                    }).map((h) => (
                                        <tr key={h.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={h.images?.[0]?.imageUrl || h.images?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80'} 
                                                        className="w-12 h-12 rounded-xl object-cover shadow-sm"
                                                        alt=""
                                                    />
                                                    <div>
                                                        <p className="font-black text-[#0B1A30] tracking-tight">{h.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{h.genderType?.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                        {h.owner?.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#0B1A30] text-sm">{h.owner?.fullName}</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                            h.owner?.ownerProfile?.verificationStatus === 'verified' ? 'text-emerald-500' : 'text-amber-500'
                                                        }`}>
                                                            {h.owner?.ownerProfile?.verificationStatus || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-[#0B1A30]">{h.city}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{h.area}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                    h.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                                    h.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {h.status === 'submitted' ? 'pending' : h.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => setSelectedHostelForReview(h)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1A30] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
                                                >
                                                    <FiEye size={14} /> Review Property
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Hostel Detail Review Modal */}
                    {selectedHostelForReview && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter">Review Property</h3>
                                        <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">Hostel: {selectedHostelForReview.name}</p>
                                    </div>
                                    <button onClick={() => setSelectedHostelForReview(null)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all duration-300">
                                        <FiXCircle size={28} className="text-[#0B1A30]" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Property Images */}
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <FiHome className="text-primary-500" /> Property Gallery
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedHostelForReview.images?.map((img, i) => (
                                                    <a key={i} href={img.imageUrl || img.url} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-square">
                                                        <img src={img.imageUrl || img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <FiEye className="text-white" size={20} />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Property Details */}
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Basic Information</h4>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender Type</p>
                                                        <p className="text-sm font-black text-[#0B1A30] uppercase tracking-tighter">{selectedHostelForReview.genderType?.replace('_', ' ')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting Price</p>
                                                        <p className="text-sm font-black text-[#0B1A30]">PKR {selectedHostelForReview.startingPrice?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Address</p>
                                                    <p className="text-sm font-bold text-[#0B1A30] leading-relaxed">{selectedHostelForReview.fullAddress}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{selectedHostelForReview.area}, {selectedHostelForReview.city}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                    {selectedHostelForReview.description || 'No description provided.'}
                                                </p>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Owner Information</h4>
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[#0B1A30]">
                                                            {selectedHostelForReview.owner?.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#0B1A30]">{selectedHostelForReview.owner?.fullName}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedHostelForReview.owner?.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        selectedHostelForReview.owner?.ownerProfile?.verificationStatus === 'verified' 
                                                            ? 'bg-emerald-50 text-emerald-600' 
                                                            : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        Owner: {selectedHostelForReview.owner?.ownerProfile?.verificationStatus || 'Pending'}
                                                    </span>
                                                </div>

                                                {/* Verification Documents if owner profile has verificationRequest */}
                                                {selectedHostelForReview.owner?.ownerProfile?.verificationRequest && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl space-y-4">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Owner Documents</p>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicFrontUrl && (
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">CNIC Front</p>
                                                                    <a 
                                                                        href={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicFrontUrl)} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="block group relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-white"
                                                                    >
                                                                        <img src={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicFrontUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="CNIC Front" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <FiEye className="text-white" size={16} />
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicBackUrl && (
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">CNIC Back</p>
                                                                    <a 
                                                                        href={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicBackUrl)} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="block group relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-white"
                                                                    >
                                                                        <img src={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.cnicBackUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="CNIC Back" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <FiEye className="text-white" size={16} />
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {selectedHostelForReview.owner.ownerProfile.verificationRequest.propertyOwnershipUrl && (
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Deed/Agreement</p>
                                                                    <a 
                                                                        href={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.propertyOwnershipUrl)} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="block group relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-white"
                                                                    >
                                                                        {selectedHostelForReview.owner.ownerProfile.verificationRequest.propertyOwnershipUrl.toLowerCase().endsWith('.pdf') ? (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                                                <FiFileText size={24} className="text-amber-500" />
                                                                                <span className="text-[8px] font-bold mt-1 text-[#0B1A30]">View PDF</span>
                                                                            </div>
                                                                        ) : (
                                                                            <img src={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.propertyOwnershipUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Deed" />
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <FiEye className="text-white" size={16} />
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {selectedHostelForReview.owner.ownerProfile.verificationRequest.utilityBillUrl && (
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Utility Bill</p>
                                                                    <a 
                                                                        href={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.utilityBillUrl)} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="block group relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-white"
                                                                    >
                                                                        {selectedHostelForReview.owner.ownerProfile.verificationRequest.utilityBillUrl.toLowerCase().endsWith('.pdf') ? (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                                                <FiFileText size={24} className="text-emerald-500" />
                                                                                <span className="text-[8px] font-bold mt-1 text-[#0B1A30]">View PDF</span>
                                                                            </div>
                                                                        ) : (
                                                                            <img src={fixCloudinaryUrl(selectedHostelForReview.owner.ownerProfile.verificationRequest.utilityBillUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Utility Bill" />
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <FiEye className="text-white" size={16} />
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                                    <button 
                                        onClick={() => handleVerifyHostel(selectedHostelForReview.id, 'rejected')}
                                        className="flex-1 py-4 rounded-2xl border border-gray-200 bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiX /> Reject Listing
                                    </button>
                                    <button 
                                        onClick={() => handleVerifyHostel(selectedHostelForReview.id, 'verified')}
                                        className="flex-2 flex-[2] py-4 rounded-2xl bg-[#0B1A30] text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-[#0B1A30]/20 flex items-center justify-center gap-2"
                                    >
                                        <FiCheck /> Approve & List Property
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Redundant modal removed */}
            {activeTab === 'verifications' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Owner Verification Requests</h2>
                            <p className="text-gray-500 mt-1 font-medium">Verify identity and property ownership of new owners</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['pending', 'verified', 'rejected', 'all'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setOwnerVerificationFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${ownerVerificationFilter === s ? 'bg-[#0B1A30] text-white border-[#0B1A30]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                >
                                    {s === 'verified' ? 'Approved' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Owner Name</th>
                                        <th className="px-8 py-6">Submission Date</th>
                                        <th className="px-8 py-6">Documents</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingOwners ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Accessing verification records...</td></tr>
                                    ) : pendingOwners.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center font-bold text-gray-400 uppercase tracking-widest text-xs">No verification requests found ({ownerVerificationFilter})</td></tr>
                                    ) : pendingOwners.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black">
                                                        {req.user?.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#0B1A30] tracking-tight">{req.user?.fullName}</p>
                                                        <p className="text-xs text-gray-400 font-bold">{req.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-[#0B1A30]">
                                                    {formatDate(req.createdAt || req.created_at)}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <a 
                                                        href={fixCloudinaryUrl(req.cnicFrontUrl || req.cnic_front_url)} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50 hover:scale-110 transition-transform"
                                                        title="CNIC Front"
                                                    >
                                                        {(req.cnicFrontUrl || req.cnic_front_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <FiFileText size={14} className="text-primary-500" />
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(req.cnicFrontUrl || req.cnic_front_url)} alt="CNIC F" className="w-full h-full object-cover" />
                                                        )}
                                                    </a>
                                                    <a 
                                                        href={fixCloudinaryUrl(req.cnicBackUrl || req.cnic_back_url)} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50 hover:scale-110 transition-transform"
                                                        title="CNIC Back"
                                                    >
                                                        {(req.cnicBackUrl || req.cnic_back_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <FiFileText size={14} className="text-primary-500" />
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(req.cnicBackUrl || req.cnic_back_url)} alt="CNIC B" className="w-full h-full object-cover" />
                                                        )}
                                                    </a>
                                                    <a 
                                                        href={fixCloudinaryUrl(req.propertyOwnershipUrl || req.property_ownership_url)} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50 hover:scale-110 transition-transform"
                                                        title="Deed"
                                                    >
                                                        {(req.propertyOwnershipUrl || req.property_ownership_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <FiFileText size={14} className="text-amber-500" />
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(req.propertyOwnershipUrl || req.property_ownership_url)} alt="Deed" className="w-full h-full object-cover" />
                                                        )}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                                    req.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                                                    req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => setSelectedOwnerReq(req)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1A30] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
                                                >
                                                    <FiEye size={14} /> Review Documents
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Verification Detail Modal */}
                    {selectedOwnerReq && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-fade-in">
                            <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up border border-white/20 flex flex-col max-h-[90vh]">
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter">Review Verification</h3>
                                        <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">Owner: {selectedOwnerReq.user?.fullName}</p>
                                    </div>
                                    <button onClick={() => setSelectedOwnerReq(null)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all duration-300">
                                        <FiXCircle size={28} className="text-[#0B1A30]" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* CNIC Documents */}
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <FiUser className="text-primary-500" /> Identity Documents
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CNIC Front</p>
                                                    <a href={fixCloudinaryUrl(selectedOwnerReq.cnicFrontUrl || selectedOwnerReq.cnic_front_url)} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50">
                                                        {(selectedOwnerReq.cnicFrontUrl || selectedOwnerReq.cnic_front_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <FiFileText size={48} className="text-primary-500" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1A30]">View PDF Document</p>
                                                            </div>
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(selectedOwnerReq.cnicFrontUrl || selectedOwnerReq.cnic_front_url)} alt="CNIC Front" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <FiEye className="text-white" size={24} />
                                                        </div>
                                                    </a>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CNIC Back</p>
                                                    <a href={fixCloudinaryUrl(selectedOwnerReq.cnicBackUrl || selectedOwnerReq.cnic_back_url)} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50">
                                                        {(selectedOwnerReq.cnicBackUrl || selectedOwnerReq.cnic_back_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <FiFileText size={48} className="text-primary-500" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1A30]">View PDF Document</p>
                                                            </div>
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(selectedOwnerReq.cnicBackUrl || selectedOwnerReq.cnic_back_url)} alt="CNIC Back" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <FiEye className="text-white" size={24} />
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property Documents */}
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <FiFileText className="text-amber-500" /> Property Proofs
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ownership Deed / Agreement</p>
                                                    <a href={fixCloudinaryUrl(selectedOwnerReq.propertyOwnershipUrl || selectedOwnerReq.property_ownership_url)} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50">
                                                        {(selectedOwnerReq.propertyOwnershipUrl || selectedOwnerReq.property_ownership_url)?.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                <FiFileText size={48} className="text-amber-500" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1A30]">View PDF Document</p>
                                                            </div>
                                                        ) : (
                                                            <img src={fixCloudinaryUrl(selectedOwnerReq.propertyOwnershipUrl || selectedOwnerReq.property_ownership_url)} alt="Ownership Deed" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <FiEye className="text-white" size={24} />
                                                        </div>
                                                    </a>
                                                </div>
                                                {(selectedOwnerReq.utilityBillUrl || selectedOwnerReq.utility_bill_url) && (
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utility Bill</p>
                                                        <a href={fixCloudinaryUrl(selectedOwnerReq.utilityBillUrl || selectedOwnerReq.utility_bill_url)} target="_blank" rel="noreferrer" className="block group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50">
                                                            {(selectedOwnerReq.utilityBillUrl || selectedOwnerReq.utility_bill_url)?.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                                                    <FiFileText size={48} className="text-emerald-500" />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0B1A30]">View PDF Document</p>
                                                                </div>
                                                            ) : (
                                                                <img src={fixCloudinaryUrl(selectedOwnerReq.utilityBillUrl || selectedOwnerReq.utility_bill_url)} alt="Utility Bill" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <FiEye className="text-white" size={24} />
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                                    <button 
                                        onClick={() => {
                                            const reason = window.prompt('Enter rejection reason:');
                                            if (reason) handleRejectOwner(selectedOwnerReq.userId, reason);
                                        }}
                                        className="flex-1 py-4 rounded-2xl border border-gray-200 bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiX /> Reject Request
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Verify this owner? They will be able to list hostels immediately.')) {
                                                handleVerifyOwner(selectedOwnerReq.userId);
                                            }
                                        }}
                                        className="flex-2 flex-[2] py-4 rounded-2xl bg-[#0B1A30] text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-[#0B1A30]/20 flex items-center justify-center gap-2"
                                    >
                                        <FiCheck /> Approve & Verify Owner
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'bookings' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">System Bookings</h2>
                            <p className="text-gray-500 mt-1 font-medium">Global view of all reservations across the platform</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {['all', 'pending', 'approved', 'confirmed', 'active_stay', 'rejected', 'cancelled', 'completed'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setBookingFilter(s)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${bookingFilter === s ? 'bg-[#0B1A30] text-white border-[#0B1A30]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <Button variant="outline" onClick={handleExportBookings} size="sm" className="border-gray-200">Export Bookings</Button>
                        </div>

                        <div className="overflow-x-auto">
                            {loadingBookings ? (
                                <div className="p-20 text-center text-gray-400">
                                    <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Fetching all bookings...</p>
                                </div>
                            ) : bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                                <div className="p-20 text-center border-2 border-dashed border-gray-50 m-6 rounded-[2rem]">
                                    <FiCalendar size={60} className="mx-auto mb-6 text-gray-100" />
                                    <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Bookings Found</h3>
                                    <p className="text-gray-400 font-medium max-w-md mx-auto">No bookings found matching the current filter.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Student</th>
                                            <th className="px-8 py-5">Property</th>
                                            <th className="px-8 py-5">Room</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Move In</th>
                                            <th className="px-8 py-5">Price</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map((b) => {
                                            const statusColors = {
                                                pending:    'text-amber-600 bg-amber-50',
                                                approved:   'text-blue-600 bg-blue-50',
                                                confirmed:  'text-emerald-600 bg-emerald-50',
                                                active_stay:'text-emerald-600 bg-emerald-50',
                                                rejected:   'text-red-600 bg-red-50',
                                                cancelled:  'text-gray-400 bg-gray-50',
                                            };
                                            return (
                                                <tr 
                                                    key={b.id} 
                                                    className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedBooking(b)}
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs">
                                                                {b.student?.fullName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-[#0B1A30] text-sm leading-tight">{b.student?.fullName || 'User'}</p>
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{b.student?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div>
                                                            <p className="font-black text-[#0B1A30] text-sm leading-tight tracking-tighter">{b.hostel?.name}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{b.hostel?.city}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 font-bold text-gray-600 text-xs">
                                                        {b.room?.roomType} Room {b.room?.roomNumber && `#${b.room.roomNumber}`}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[b.status] || 'text-gray-400 bg-gray-50'}`}>
                                                            {b.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 font-bold text-[#0B1A30] text-xs">
                                                        {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-[#0B1A30] text-xs">
                                                        PKR {b.monthlyPrice?.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                            <button 
                                                                onClick={() => setSelectedBooking(b)}
                                                                className="p-2 text-gray-400 hover:text-[#0B1A30] hover:bg-gray-100 rounded-xl transition-all"
                                                            >
                                                                <FiEdit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteBooking(b.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
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
            )}

            {activeTab === 'finance' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Platform Finance</h2>
                            <p className="text-gray-500 mt-1 font-medium">Revenue tracking, payouts and platform commissions</p>
                        </div>
                    </div>
                    
                    {/* Finance Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard 
                            label="Total Revenue" 
                            value={financeStats.totalRevenue?.toLocaleString()} 
                            prefix="PKR"
                            badge="Platform Total" 
                            badgeColor="text-emerald-600 bg-emerald-50" 
                            borderClass="border-emerald-500" 
                        />
                        <StatCard 
                            label="Platform Earnings" 
                            value={financeStats.platformFees?.toLocaleString()} 
                            prefix="PKR"
                            badge="Commission" 
                            badgeColor="text-primary-600 bg-primary-50" 
                            borderClass="border-[#0B1A30]" 
                        />
                        <StatCard 
                            label="Transactions" 
                            value={financeStats.totalTransactions} 
                            badge="Completed" 
                            badgeColor="text-gray-600 bg-gray-100" 
                            borderClass="border-gray-200" 
                        />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/20">
                            <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">Recent Transactions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {loadingFinance ? (
                                <div className="p-20 text-center text-gray-400">
                                    <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Accessing Ledger...</p>
                                </div>
                            ) : financeStats.recentTransactions?.length === 0 ? (
                                <div className="p-20 text-center">
                                    <FiDollarSign size={60} className="mx-auto mb-6 text-gray-100" />
                                    <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Transactions Yet</h3>
                                    <p className="text-gray-400 font-medium">Platform financial data will appear here once payments are processed.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FA] text-[#0B1A30] text-[9px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Student</th>
                                            <th className="px-8 py-5">Hostel</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Fee</th>
                                            <th className="px-8 py-5 text-right">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {financeStats.recentTransactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5 font-bold text-[#0B1A30] text-sm">{t.student}</td>
                                                <td className="px-8 py-5 text-gray-500 text-xs font-medium">{t.hostel}</td>
                                                <td className="px-8 py-5 text-gray-500 text-xs">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                                                <td className="px-8 py-5 text-primary-600 font-bold text-xs">PKR {t.fee.toLocaleString()}</td>
                                                <td className="px-8 py-5 text-right font-black text-[#0B1A30] text-sm">PKR {t.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">System Settings</h2>
                        <p className="text-gray-500 mt-1 font-medium">Configure global platform rules and fees</p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden max-w-3xl">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                            <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter">Commission Setup</h3>
                            <p className="text-xs text-gray-400 mt-1">Configure how platform fees are calculated for online payments</p>
                        </div>
                        <div className="p-8 space-y-8">
                            
                            {/* Commission Mode Selection */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Commission Mode</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['percentage', 'fixed', 'hybrid'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setCommissionSettings({ ...commissionSettings, mode: m })}
                                            className={`px-4 py-4 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all ${
                                                commissionSettings.mode === m 
                                                    ? 'bg-[#0B1A30] border-[#0B1A30] text-white' 
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Percentage Rate Input */}
                                <div className={commissionSettings.mode === 'fixed' ? 'opacity-30 pointer-events-none' : ''}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Percentage Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={commissionSettings.rate}
                                            onChange={(e) => setCommissionSettings({ ...commissionSettings, rate: e.target.value })}
                                            disabled={loadingSettings || savingSettings}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0B1A30]/20 font-bold text-lg text-[#0B1A30]"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">%</span>
                                    </div>
                                </div>

                                {/* Fixed Fee Input */}
                                <div className={commissionSettings.mode === 'percentage' ? 'opacity-30 pointer-events-none' : ''}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Fixed Base Fee (PKR)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px] uppercase tracking-widest">PKR</span>
                                        <input
                                            type="number"
                                            value={commissionSettings.fixedFee}
                                            onChange={(e) => setCommissionSettings({ ...commissionSettings, fixedFee: e.target.value })}
                                            disabled={loadingSettings || savingSettings}
                                            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#0B1A30]/20 font-bold text-lg text-[#0B1A30]"
                                            min="0"
                                            step="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSaveCommissionRate}
                                    disabled={savingSettings || loadingSettings}
                                    className="px-8 py-4 bg-[#0B1A30] hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingSettings ? 'Saving...' : 'Update Settings'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Student Reviews</h2>
                        <p className="text-gray-500 mt-1 font-medium">Moderate and monitor hostel reviews submitted by students</p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                            <h3 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter">Review Moderation Registry</h3>
                            <span className="text-[10px] bg-primary-50 text-primary-600 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {reviews.length} Total Submissions
                            </span>
                        </div>

                        {loadingReviews ? (
                            <div className="p-20 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Accessing review database...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiMessageSquare size={32} className="text-gray-200" />
                                </div>
                                <h4 className="text-lg font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Reviews Found</h4>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">When students complete their stays, their hostel reviews will appear here for your moderation.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-8 hover:bg-gray-50/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg">
                                                    {review.student_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-base font-black text-[#0B1A30]">{review.student_name}</h4>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                            review.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                            review.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-red-50 text-red-600'
                                                        }`}>
                                                            {review.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{review.hostel_name} • Duration: {review.stay_duration_months} Months</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-sm font-black text-[#0B1A30]">{review.title}</h5>
                                                <p className="text-sm text-gray-600 leading-relaxed mt-1 font-medium">{review.body}</p>
                                            </div>

                                            {/* Sub-ratings grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                                                {[
                                                    { label: 'Overall', val: review.overall_rating },
                                                    { label: 'Cleanliness', val: review.cleanliness },
                                                    { label: 'Food', val: review.food_quality },
                                                    { label: 'Safety', val: review.safety_security },
                                                    { label: 'Facilities', val: review.facilities_match },
                                                    { label: 'Owner', val: review.owner_management },
                                                    { label: 'Value', val: review.value_for_money }
                                                ].map((sub, idx) => (
                                                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{sub.label}</p>
                                                        <p className="text-xs font-black text-[#0B1A30] mt-0.5">{sub.val}/5</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {new Date(review.created_at || review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            
                                            {review.status === 'pending' ? (
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <button
                                                        onClick={() => handleRejectReview(review.id)}
                                                        className="px-4 py-2 border border-gray-100 text-[10px] font-black text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl uppercase tracking-widest transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveReview(review.id)}
                                                        className="px-4 py-2 bg-[#0B1A30] text-white text-[10px] font-black hover:bg-gray-800 rounded-xl uppercase tracking-widest shadow-md transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">Moderated</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!['dashboard', 'users', 'hostels', 'all_hostels', 'bookings', 'finance', 'verifications', 'settings', 'support', 'reviews'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full p-20 text-gray-400 animate-fade-in">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                        <FiGrid size={24} className="opacity-20" />
                    </div>
                    <p className="font-black uppercase tracking-[0.2em] text-[9px]">Module <span className="text-[#0B1A30]">{activeTab?.toString()?.replace('_', ' ')}</span> is being initialized...</p>
                </div>
            )}

            {/* Booking Details Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBooking(null)}
                            className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 sm:p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            Booking Details
                                        </span>
                                        <h3 className="text-2xl font-black text-[#0B1A30] mt-2 tracking-tight">
                                            {selectedBooking.hostel?.name}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedBooking(null)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Student Info */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Student Information</p>
                                        <div>
                                            <p className="text-sm font-bold text-[#0B1A30]">{selectedBooking.student?.fullName}</p>
                                            <p className="text-xs text-gray-500 font-medium">{selectedBooking.student?.email}</p>
                                            <p className="text-xs text-gray-500 font-medium">{selectedBooking.student?.phone || 'No phone provided'}</p>
                                        </div>
                                    </div>

                                    {/* Owner Info */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Owner Information</p>
                                        <div>
                                            <p className="text-sm font-bold text-[#0B1A30]">{selectedBooking.hostel?.owner?.fullName || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 font-medium">{selectedBooking.hostel?.owner?.email || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Stay Details */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Stay Details</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Room</p>
                                                <p className="text-xs font-bold">#{selectedBooking.room?.roomNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Move-in</p>
                                                <p className="text-xs font-bold">{new Date(selectedBooking.moveInDate).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Details */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Financials</p>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase">Monthly Price</p>
                                            <p className="text-sm font-black text-primary-600">PKR {selectedBooking.monthlyPrice?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-gray-50 p-6 rounded-3xl">
                                    <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">Admin Actions</p>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { label: 'Pending', status: 'pending', color: 'bg-amber-500' },
                                            { label: 'Approve', status: 'approved', color: 'bg-blue-500' },
                                            { label: 'Confirm', status: 'confirmed', color: 'bg-emerald-500' },
                                            { label: 'Reject', status: 'rejected', color: 'bg-red-500' },
                                            { label: 'Cancel', status: 'cancelled', color: 'bg-gray-500' },
                                        ].map((act) => (
                                            <button
                                                key={act.status}
                                                onClick={() => handleUpdateBookingStatus(selectedBooking.id, act.status)}
                                                disabled={updatingBooking || selectedBooking.status === act.status}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${act.color} ${selectedBooking.status === act.status ? 'ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                            >
                                                {act.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            handleDeleteBooking(selectedBooking.id);
                                            setSelectedBooking(null);
                                        }}
                                        className="w-full py-4 border-2 border-red-100 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-colors"
                                    >
                                        Delete Booking Record
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {activeTab === 'support' && (
                <div className="space-y-8 animate-fade-in pb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Support Inbox</h2>
                            <p className="text-gray-500 mt-1 font-medium">Manage platform support inquiries from students and owners</p>
                        </div>
                        <button
                            onClick={handleDeleteAllChats}
                            className="px-4 py-2 bg-red-50 text-red-600 font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            <FiTrash2 size={14} /> Clear All Chats
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex overflow-hidden" style={{ minHeight: '70vh' }}>
                        {/* LEFT: Inquiry List */}
                        <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/30">
                            <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between">
                                <h3 className="font-black text-[#0B1A30] text-sm uppercase tracking-widest">All Inquiries</h3>
                                <span className="text-[10px] bg-primary-50 text-primary-600 font-black px-2 py-1 rounded-full uppercase tracking-widest">
                                    {supportInquiries.length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {loadingInquiries ? (
                                    <div className="p-10 flex flex-col items-center justify-center text-gray-400">
                                        <div className="animate-spin w-6 h-6 border-2 border-[#0B1A30] border-t-transparent rounded-full mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
                                    </div>
                                ) : supportInquiries.length === 0 ? (
                                    <div className="p-10 flex flex-col items-center justify-center text-gray-400">
                                        <FiMessageSquare size={32} className="mb-3 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Inquiries Yet</p>
                                    </div>
                                ) : (
                                    supportInquiries.map(inq => {
                                        const role = inq.student?.role || 'student';
                                        const roleColor = role === 'owner' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
                                        const isSelected = selectedInquiry?.id === inq.id;
                                        return (
                                            <div
                                                key={inq.id}
                                                onClick={() => { setSelectedInquiry(inq); setInquiryMessages([]); fetchInquiryMessages(inq.id); }}
                                                className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${isSelected ? 'bg-[#0B1A30] border-l-[3px] border-l-primary-400' : 'hover:bg-white border-l-[3px] border-l-transparent'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-black text-sm ${isSelected ? 'text-white' : 'text-[#0B1A30]'}`}>
                                                        {inq.student?.fullName || 'Unknown'}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${roleColor}`}>
                                                        {role}
                                                    </span>
                                                </div>
                                                <p className={`text-[10px] line-clamp-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {inq.lastMessagePreview || 'No messages yet'}
                                                </p>
                                                <p className={`text-[9px] mt-2 font-bold ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                                                    {new Date(inq.lastMessageAt || inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Chat View */}
                        <div className="flex-1 flex flex-col bg-white">
                            {selectedInquiry ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0B1A30]/5 flex items-center justify-center text-[#0B1A30] font-black text-lg border border-[#0B1A30]/10">
                                            {selectedInquiry.student?.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-[#0B1A30] text-lg">{selectedInquiry.student?.fullName}</h3>
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                                                    selectedInquiry.student?.role === 'owner' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {selectedInquiry.student?.role || 'Student'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">{selectedInquiry.student?.email}</p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                        {inquiryMessages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                                <FiMessageSquare size={36} className="mb-3 opacity-30" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No messages loaded</p>
                                            </div>
                                        ) : (
                                            inquiryMessages.map(msg => {
                                                const isAdmin = ['admin', 'super_admin'].includes(msg.senderRole);
                                                const senderLabel = msg.senderRole === 'student' ? 'Student' :
                                                    msg.senderRole === 'owner' ? 'Owner' :
                                                    msg.senderRole === 'admin' || msg.senderRole === 'super_admin' ? 'Roomzy Support' : msg.senderRole;
                                                const badgeClass = msg.senderRole === 'student' ? 'bg-blue-50 text-blue-500' :
                                                    msg.senderRole === 'owner' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-[#0B1A30]/10 text-[#0B1A30]';
                                                return (
                                                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-widest ${badgeClass}`}>
                                                            {senderLabel}
                                                        </span>
                                                        <div className={`max-w-[65%] rounded-2xl px-5 py-3.5 ${isAdmin ? 'bg-[#0B1A30] text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-[#0B1A30] rounded-tl-sm'}`}>
                                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                                            <p className={`text-[9px] mt-2 font-bold ${isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Reply Box */}
                                    <div className="p-6 border-t border-gray-100 bg-white">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full bg-[#0B1A30] flex items-center justify-center shrink-0">
                                                <span className="text-white text-[9px] font-black">ADM</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type your reply as Roomzy Support..."
                                                className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-full outline-none focus:border-primary-300 transition-colors text-sm"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="px-6 py-3.5 bg-[#0B1A30] text-white text-xs font-black rounded-full uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 border border-gray-100">
                                        <FiMessageSquare size={32} className="opacity-30" />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-[10px]">Select an inquiry from the left</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Hostel Details Modal */}
            <AnimatePresence>
                {selectedHostelDetails && !isHostelEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedHostelDetails(null)}
                            className="absolute inset-0 bg-[#0B1A30]/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            Hostel Profile
                                        </span>
                                        <h3 className="text-3xl font-black text-[#0B1A30] mt-2 tracking-tight">{selectedHostelDetails.name}</h3>
                                        <p className="text-gray-400 font-bold text-sm mt-1">{selectedHostelDetails.area}, {selectedHostelDetails.city}</p>
                                    </div>
                                    <button onClick={() => { setSelectedHostelDetails(null); setIsHostelEditModalOpen(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="aspect-video rounded-3xl overflow-hidden shadow-lg">
                                            <img 
                                                src={selectedHostelDetails.images?.[0]?.imageUrl || selectedHostelDetails.images?.[0]} 
                                                className="w-full h-full object-cover" 
                                                alt="Main" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedHostelDetails.images?.slice(1, 4).map((img, i) => (
                                                <img key={i} src={img.imageUrl || img} className="w-full aspect-square rounded-2xl object-cover shadow-sm" alt="" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Ownership</p>
                                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                                <div className="w-12 h-12 rounded-full bg-[#0B1A30] flex items-center justify-center text-white font-black">
                                                    {selectedHostelDetails.owner?.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#0B1A30]">{selectedHostelDetails.owner?.fullName}</p>
                                                    <p className="text-xs text-gray-500">{selectedHostelDetails.owner?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-4">Description</p>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {selectedHostelDetails.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-primary-50 p-4 rounded-2xl">
                                                <p className="text-[9px] font-black text-primary-600 uppercase">Gender Type</p>
                                                <p className="text-sm font-black text-[#0B1A30] uppercase">{selectedHostelDetails.genderType}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-2xl">
                                                <p className="text-[9px] font-black text-emerald-600 uppercase">Starting Price</p>
                                                <p className="text-sm font-black text-[#0B1A30]">PKR {selectedHostelDetails.startingPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 pt-8 border-t flex gap-4">
                                    <Button onClick={() => setIsHostelEditModalOpen(true)} className="flex-1 bg-[#0B1A30]">Edit Hostel Information</Button>
                                    <Button variant="outline" onClick={() => handleDeleteHostel(selectedHostelDetails.id)} className="flex-1 text-red-500 border-red-100 hover:bg-red-50">Delete Property</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hostel Edit Modal */}
            <AnimatePresence>
                {isHostelEditModalOpen && selectedHostelDetails && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsHostelEditModalOpen(false)}
                            className="absolute inset-0 bg-[#0B1A30]/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await api.patch(`/hostels/admin/${selectedHostelDetails.id}`, selectedHostelDetails);
                                        toast.success('Hostel updated successfully');
                                        setIsHostelEditModalOpen(false);
                                        fetchHostels();
                                    } catch (err) {
                                        toast.error('Failed to update hostel');
                                    }
                                }} 
                                className="p-8"
                            >
                                <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-6">Edit Property Data</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Hostel Name</label>
                                        <input type="text" value={selectedHostelDetails.name} onChange={e => setSelectedHostelDetails({...selectedHostelDetails, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">City</label>
                                            <input type="text" value={selectedHostelDetails.city} onChange={e => setSelectedHostelDetails({...selectedHostelDetails, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Area</label>
                                            <input type="text" value={selectedHostelDetails.area} onChange={e => setSelectedHostelDetails({...selectedHostelDetails, area: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Monthly Starting Price</label>
                                        <input type="number" value={selectedHostelDetails.startingPrice} onChange={e => setSelectedHostelDetails({...selectedHostelDetails, startingPrice: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsHostelEditModalOpen(false)} className="flex-1">Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-[#0B1A30]">Update Data</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Created Credentials Modal */}
            <AnimatePresence>
                {createdCredentials && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0B1A30]/90 backdrop-blur-lg"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FiCheckCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">Account Created</h3>
                                <p className="text-gray-500 font-medium text-sm mb-8">Please share these credentials with the user safely.</p>
                                
                                <div className="space-y-4 bg-gray-50 p-6 rounded-3xl text-left mb-8 border border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="font-bold text-[#0B1A30] select-all">{createdCredentials.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Generated Password</p>
                                        <p className="font-bold text-primary-600 select-all">{createdCredentials.password}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Role</p>
                                        <p className="font-bold text-[#0B1A30] uppercase text-xs">{createdCredentials.role}</p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => setCreatedCredentials(null)}
                                    className="w-full py-4 bg-[#0B1A30] rounded-2xl font-black uppercase tracking-widest"
                                >
                                    Dismiss & Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
