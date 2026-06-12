import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageCircle, FiHome, FiUserCheck, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import ScrollReveal from '../../components/shared/ScrollReveal';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

import { APP_CONFIG } from '../../config';

export default function Contact() {
    const { isAuthenticated } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot check
        if (form.website) {
            console.log('Bot detected');
            return;
        }

        if (form.message.length < 10) {
            toast.error('Message must be at least 10 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/contact', {
                name: form.name,
                email: form.email,
                subject: form.subject,
                message: form.message
            });
            toast.success('Message sent successfully! We will get back to you within 24 hours.');
            setForm({ name: '', email: '', subject: '', message: '', website: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const contactInfo = [
        { icon: FiMail, title: 'Email Support', detail: APP_CONFIG.supportEmail, sub: 'Verified response in 24h', copyable: true },
        { icon: FiPhone, title: 'Direct Line', detail: APP_CONFIG.supportPhone, sub: 'Available 9AM - 6PM', copyable: true },
        { icon: FiMapPin, title: 'Local Office', detail: APP_CONFIG.officeAddress, sub: 'Hazara Division, KPK', copyable: true },
        { icon: FiClock, title: 'Active Hours', detail: 'Mon – Saturday', sub: 'Support on weekends too', copyable: false },
    ];

    const supportTracks = [
        {
            icon: FiUserCheck,
            title: 'For Students',
            desc: 'Need help finding a specific hostel near your institute? Our local scouts can guide you to the safest options.',
            btnText: 'Ask for Guidance',
            path: '#form',
            isExternal: false
        },
        {
            icon: FiHome,
            title: 'For Owners',
            desc: 'Want to digitize your hostel in Mansehra or Abbottabad? Let us help you join the Roomzy verified network.',
            btnText: 'List My Hostel',
            path: '/signup',
            isExternal: false
        }
    ];

    return (
        <div className="pt-20 bg-gray-50/50 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 sm:py-32 bg-gray-900 overflow-hidden">
                {/* Visual Glassmorphic glow elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/80 to-gray-900/95" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] opacity-70 pointer-events-none" />
                </div>
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-primary-300 text-xs font-bold tracking-wider mb-8 uppercase"
                    >
                        <FiMessageCircle size={14} className="animate-pulse" />
                        <span>Always Here to Help</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl sm:text-6xl font-[900] text-white tracking-tight mb-6 leading-tight"
                    >
                        Get In Touch With <br /> <span className="text-primary-400">Roomzy Support</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Have questions about a listing, bookings, or want to partner with us? Our team is dedicated to helping every student in Abbottabad and Mansehra find a perfect, secure place.
                    </motion.p>
                </div>
            </section>

            {/* Quick Contact Grid */}
            <section className="py-12 sm:py-20 -mt-10 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-24">
                        {contactInfo.map(({ icon: Icon, title, detail, sub, copyable }, i) => (
                            <ScrollReveal key={title} delay={i * 0.08}>
                                <div className="group relative p-8 rounded-[2rem] bg-white border border-gray-150/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Icon size={24} className="text-primary-600" />
                                        </div>
                                        <h3 className="font-bold text-text-primary text-lg mb-2 tracking-tight">{title}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{sub}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
                                        <span className="text-xs sm:text-sm text-primary-600 font-extrabold break-all leading-tight">{detail}</span>
                                        {copyable && (
                                            <button
                                                onClick={() => handleCopy(detail, i)}
                                                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors shrink-0"
                                                title="Copy to clipboard"
                                            >
                                                {copiedIndex === i ? <FiCheck size={14} className="text-emerald-500" /> : <FiCopy size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Form + Map Section */}
                    <div id="form" className="grid lg:grid-cols-12 gap-12 bg-white rounded-[3rem] border border-gray-150/80 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden mb-16 sm:mb-24">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none" />

                        {/* Direct Message Form (7cols) */}
                        <div className="lg:col-span-7 relative z-10">
                            <ScrollReveal direction="left">
                                <div className="space-y-4 mb-8">
                                    <h2 className="text-3xl font-black text-text-primary tracking-tight">Send a Direct Message</h2>
                                    <p className="text-text-muted font-medium text-sm sm:text-base">Prefer writing? Complete the form below, and our support team will get back to you shortly.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                placeholder="Student or Owner Name"
                                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-semibold text-[#0B1A30] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="yourname@email.com"
                                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-semibold text-[#0B1A30] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="How can we assist you today?"
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-semibold text-[#0B1A30] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Please describe your query or problem in detail so we can assist you efficiently..."
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm font-semibold text-[#0B1A30] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all resize-none"
                                        />
                                    </div>

                                    {/* Honeypot field - hidden from users */}
                                    <div className="hidden" aria-hidden="true">
                                        <input
                                            type="text"
                                            name="website"
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                            tabIndex="-1"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full rounded-2xl shadow-xl shadow-primary-500/10 py-4.5 font-bold uppercase tracking-widest text-xs"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        <FiSend size={16} className="mr-2" />
                                        {isSubmitting ? 'Sending Message...' : 'Send Message'}
                                    </Button>
                                </form>
                            </ScrollReveal>
                        </div>

                        {/* Visual Map/HQ container (5cols) */}
                        <div className="lg:col-span-5 relative">
                            <ScrollReveal direction="right" className="h-full">
                                <div className="h-full min-h-[450px] lg:min-h-0 rounded-[2.25rem] overflow-hidden border border-gray-150 shadow-inner relative group bg-gray-50">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53004.95712576965!2d73.19268!3d34.14674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38de31904e312e2d%3A0x5a82b71fd504cbee!2sAbbottabad%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '450px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Roomzy Office Location — Abbottabad, KPK"
                                        className="w-full h-full object-cover grayscale-[0.15] contrast-[1.05] group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    {/* HQ Card overlay */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl z-20 border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-primary-500/10">
                                                <FiMapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-text-primary uppercase tracking-wider">Local Headquarters</p>
                                                <p className="text-sm font-semibold text-text-secondary mt-0.5">Mandian, Abbottabad, KPK</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>

                    {/* Support Pathways (Newly Rendered) */}
                    <div className="text-center mb-10">
                        <ScrollReveal>
                            <p className="text-primary-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Support Tracks</p>
                            <h2 className="text-3xl font-black text-[#0B1A30] tracking-tight">Tailored Assistance For Everyone</h2>
                        </ScrollReveal>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {supportTracks.map((track, idx) => {
                            const TrackIcon = track.icon;
                            return (
                                <ScrollReveal key={idx} delay={idx * 0.12}>
                                    <div className="p-8 rounded-[2.5rem] bg-white border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group hover:border-primary-100">
                                        <div className="space-y-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <TrackIcon size={26} />
                                            </div>
                                            <h3 className="text-xl font-bold text-text-primary group-hover:text-primary-600 transition-colors">{track.title}</h3>
                                            <p className="text-sm text-text-muted leading-relaxed font-medium">{track.desc}</p>
                                        </div>
                                        <div className="mt-8 pt-4 border-t border-gray-50">
                                            {track.path.startsWith('#') ? (
                                                <a
                                                    href={track.path}
                                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors"
                                                >
                                                    {track.btnText}
                                                    <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </a>
                                            ) : (
                                                <a
                                                    href={track.path}
                                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors"
                                                >
                                                    {track.btnText}
                                                    <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
