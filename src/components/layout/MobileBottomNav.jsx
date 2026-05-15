import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiCalendar, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
    const location = useLocation();

    const navItems = [
        { label: 'Home', icon: FiHome, path: '/' },
        { label: 'Explore', icon: FiSearch, path: '/listings' },
        { label: 'Bookings', icon: FiCalendar, path: '/dashboard/student/bookings' },
        { label: 'Profile', icon: FiUser, path: '/dashboard/settings' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-border-light pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center justify-center flex-1 py-1 relative"
                        >
                            <div className={`transition-all duration-300 ${isActive ? 'text-primary-600' : 'text-text-muted'}`}>
                                <item.icon size={22} className={isActive ? 'scale-110' : ''} />
                            </div>
                            <span className={`text-[10px] font-bold mt-1 transition-colors ${isActive ? 'text-primary-600' : 'text-text-muted'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -top-1 w-8 h-1 bg-primary-500 rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
