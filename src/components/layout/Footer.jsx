import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { APP_CONFIG } from '../../config';
import logo from '../../assets/logo.jpg';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        'Explore': [
            { name: 'Home', path: '/' },
            { name: 'Browse Hostels', path: '/listings' },
            { name: 'About Us', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'FAQs', path: '/faq' },
        ],
        'For Students': [
            { name: 'Find a Hostel', path: '/listings' },
            { name: 'How It Works', path: '/#how-it-works' },
            { name: 'Safety Guidelines', path: '/about' },
            { name: 'Sign Up', path: '/signup' },
        ],
        'For Owners': [
            { name: 'List Your Hostel', path: '/signup' },
            { name: 'Verification Process', path: '/faq' },
            { name: 'Owner Login', path: '/login' },
        ],
    };

    const socialLinks = [
        { icon: FiFacebook, href: APP_CONFIG.social.facebook, label: 'Facebook' },
        { icon: FiInstagram, href: APP_CONFIG.social.instagram, label: 'Instagram' },
        { icon: FiTwitter, href: APP_CONFIG.social.twitter, label: 'Twitter' },
        { icon: FiLinkedin, href: APP_CONFIG.social.linkedin, label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-surface-dark text-white">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img
                                src={logo}
                                alt={APP_CONFIG.name}
                                className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <span className="text-xl font-bold">{APP_CONFIG.name}</span>
                        </Link>
                        <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xs">
                            {APP_CONFIG.description}
                        </p>
                        <div className="flex gap-3 mt-6">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-primary-600 hover:border-primary-600 transition-all duration-200"
                                    aria-label={label}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-4">{title}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="text-sm text-white/50 hover:text-white transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mt-10 pt-8 border-t border-white/10 text-sm text-white/40">
                    <div className="flex items-center gap-2">
                        <FiMail size={16} />
                        <span className="text-white/50">{APP_CONFIG.supportEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiPhone size={16} />
                        <span className="text-white/50">{APP_CONFIG.supportPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiMapPin size={16} />
                        <span className="text-white/50">{APP_CONFIG.officeAddress}</span>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
                        <p>© {currentYear} {APP_CONFIG.name}. All rights reserved.</p>
                        <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
                            <Link to="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
                            <Link to="/refund-policy" className="hover:text-white/60 transition-colors">Refund Policy</Link>
                            <Link to="/terms-conditions" className="hover:text-white/60 transition-colors">Terms & Conditions</Link>
                            <Link to="/service-policy" className="hover:text-white/60 transition-colors">Service Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
