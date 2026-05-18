import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBell, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardLayout({ tabs, activeTab, setActiveTab, children }) {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleTabChange = (id) => {
        const rolePath = `/dashboard/${user?.role}`;
        const isSettingsPage = window.location.pathname === '/dashboard/settings';
        const isOwnerListPage = window.location.pathname === '/dashboard/owner/list-hostel';
        const isSubPage = window.location.pathname.includes('/manage-rooms/') || (user?.role === 'student' && window.location.pathname.includes('/bookings'));

        if (id === 'settings' && user?.role !== 'admin') {
            if (!isSettingsPage) navigate('/dashboard/settings');
        } else if (id === 'dashboard') {
            if (window.location.pathname !== rolePath) navigate(rolePath);
            else setActiveTab('dashboard');
        } else if (id === 'bookings' && user?.role === 'student') {
            // Student bookings can be a tab or a separate page
            if (window.location.pathname === '/dashboard/student/bookings') {
                // Already on bookings page
            } else if (window.location.pathname === rolePath) {
                setActiveTab('bookings');
            } else {
                navigate('/dashboard/student/bookings');
            }
        } else {
            if (isSettingsPage || isOwnerListPage || isSubPage) {
                navigate(rolePath, { state: { activeTab: id } });
            } else {
                setActiveTab(id);
            }
        }
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-[100dvh] bg-surface-alt overflow-hidden">
            {/* Mobile Sidebar Overlay Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Dark Theme matching Home Hero bg-gray-900) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo & Brand */}
                <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
                    <Link to="/" className="flex items-center group">
                        <img src="/logo.jpg" alt="Roomzy" className="w-9 h-9 rounded-xl mr-3 shadow-sm transition-transform duration-300 group-hover:scale-105" />
                        <h1 className="font-[800] text-xl tracking-tight text-white transition-colors duration-300 group-hover:text-primary-400">Roomzy</h1>
                    </Link>
                    {/* Close button for mobile */}
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Navigation Tabs with Smooth Transitions */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
                    {tabs.map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => handleTabChange(id)}
                                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-500 group overflow-hidden ${
                                    isActive
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                {/* Active Background Pill */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary-500/20 border border-primary-500/20 z-0 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBar"
                                        className="absolute left-0 top-3 bottom-3 w-1 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <Icon size={18} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-primary-300' : 'group-hover:scale-110'}`} />
                                <span className={`relative z-10 transition-all duration-300 ${isActive ? 'pl-1' : 'group-hover:pl-1'}`}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                
                {/* User Profile Card & Logout (Restored to Sidebar) */}
                <div className="p-4 border-t border-white/10 shrink-0">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-all duration-300 hover:bg-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 overflow-hidden">
                                {user?.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    user?.fullName?.charAt(0)?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User Name'}</p>
                                <p className="text-xs text-gray-400 truncate capitalize font-medium">{user?.role || 'Role'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        >
                            <FiLogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
                
                {/* Footer safe area for PWA */}
                <div className="h-safe-bottom" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full relative">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-border-light flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 shadow-sm">
                    {/* Left: Mobile Menu Toggle & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg lg:hidden transition-colors"
                        >
                            <FiMenu size={24} />
                        </button>
                        
                        <div className="relative w-full max-w-md hidden md:block group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search hostels, bookings, or history..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 rounded-xl border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all duration-300"
                            />
                        </div>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <button className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
                            <FiBell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/settings')}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiSettings size={20} />
                        </button>
                    </div>
                </header>

                {/* Dynamic View Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 bg-surface-alt relative">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto w-full pb-safe"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
