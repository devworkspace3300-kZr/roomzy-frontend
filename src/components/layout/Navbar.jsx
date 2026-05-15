import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';
import { NAV_LINKS } from '../../constants';
import { APP_CONFIG } from '../../config';
import logo from '../../assets/logo.jpg';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location]);

    const isHome = location.pathname === '/';
    const navBg = isScrolled || !isHome
        ? 'bg-white/95 backdrop-blur-md shadow-nav border-b border-border-light'
        : 'bg-transparent';
    const textColor = isScrolled || !isHome ? 'text-text-primary' : 'text-white';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-[72px]">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img
                            src={logo}
                            alt={APP_CONFIG.name}
                            className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <span className={`text-xl font-bold transition-colors ${textColor}`}>
                            {APP_CONFIG.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? `${isScrolled || !isHome ? 'text-primary-600 bg-primary-50' : 'text-white bg-white/15'}`
                                        : `${textColor} hover:bg-primary-50/80 hover:text-primary-600`
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/login"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isScrolled || !isHome
                                ? 'text-text-secondary hover:text-primary-600 hover:bg-primary-50'
                                : 'text-white/90 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl gradient-primary shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${textColor} hover:bg-white/10`}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-white border-t border-border overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {NAV_LINKS.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-text-secondary hover:text-primary-600 hover:bg-primary-50/60'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-3 border-t border-border mt-3 flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-text-secondary rounded-xl border border-border hover:border-primary-300 hover:text-primary-600 transition-colors"
                                >
                                    <FiUser size={16} /> Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-white rounded-xl gradient-primary shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
