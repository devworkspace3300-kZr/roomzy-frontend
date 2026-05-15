import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageCircle, FiHome, FiUserCheck } from 'react-icons/fi';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Honeypot check
        if (form.website) {
            console.log('Bot detected');
            return;
        }

        if (!isAuthenticated) {
            toast.error('Please login to send a direct message. You can also email us directly at ' + APP_CONFIG.supportEmail);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/chat/direct', {
                content: `[${form.subject}] ${form.message}`,
                // recipientId: null // Goes to system admin
            });
            toast.success('Direct message sent! Our team will review it shortly.');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again or use email.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        { icon: FiMail, title: 'Email Support', detail: APP_CONFIG.supportEmail, sub: 'Verified response in 24h' },
        { icon: FiPhone, title: 'Direct Line', detail: APP_CONFIG.supportPhone, sub: 'Available 9AM - 6PM' },
        { icon: FiMapPin, title: 'Local Office', detail: APP_CONFIG.officeAddress, sub: 'Hazara Division, KPK' },
        { icon: FiClock, title: 'Active Hours', detail: 'Mon – Saturday', sub: 'Support on weekends too' },
    ];

    const supportTracks = [
        {
            icon: FiUserCheck,
            title: 'For Students',
            desc: 'Need help finding a specific hostel near your institute? Our local scouts can guide you to the safest options.',
            btnText: 'Ask for Guidance',
            path: '#form'
        },
        {
            icon: FiHome,
            title: 'For Owners',
            desc: 'Want to digitize your hostel in Mansehra or Abbottabad? Let us help you join the Roomzy verified network.',
            btnText: 'List My Hostel',
            path: '/signup'
        }
    ];

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative py-24 sm:py-32 gradient-hero overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-300/10 rounded-full blur-[120px]" />

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-300 text-sm font-medium mb-8"
                    >
                        <FiMessageCircle size={16} />
                        <span>Always Here to Help</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-8"
                    >
                        Let&apos;s Build a Safer <br className="hidden sm:block" /> <span className="gradient-text font-black">Student Community</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Have questions about a listing or want to partner with us? Our team is dedicated to helping every student in Hazara find a home near their institution.
                    </motion.p>
                </div>
            </section>

            {/* Quick Contact Grid */}
            <section className="py-24 sm:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {contactInfo.map(({ icon: Icon, title, detail, sub }, i) => (
                            <ScrollReveal key={title} delay={i * 0.1}>
                                <div className="group p-8 rounded-3xl bg-white border border-border-light shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <Icon size={28} className="text-primary-500" />
                                    </div>
                                    <h3 className="font-bold text-text-primary mb-2 tracking-tight">{title}</h3>
                                    <p className="text-sm text-primary-600 font-bold mb-1 break-all">{detail}</p>
                                    <p className="text-xs text-text-muted font-medium">{sub}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Specialized Tracks */}
                    <div className="grid md:grid-cols-2 gap-8 mb-24">
                        {supportTracks.map((track, i) => (
                            <ScrollReveal key={track.title} direction={i === 0 ? 'left' : 'right'}>
                                <div className="p-10 rounded-[2.5rem] bg-surface-alt border border-border-light flex flex-col items-start gap-6 h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500">
                                        <track.icon size={30} />
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight">{track.title}</h3>
                                    <p className="text-text-secondary text-lg leading-relaxed flex-grow">{track.desc}</p>
                                    <Button variant={i === 0 ? 'primary' : 'secondary'} size="lg" className="rounded-2xl" as="a" href={track.path}>
                                        {track.btnText}
                                    </Button>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Form + Map */}
                    <div id="form" className="grid lg:grid-cols-2 gap-12 bg-white rounded-[3rem] border border-border-light p-8 sm:p-12 shadow-2xl shadow-primary-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <ScrollReveal direction="left">
                            <div className="relative">
                                <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Direct Message</h2>
                                <p className="text-text-secondary text-lg mb-10">Prefer writing? Send us your detailed query and we will investigate it locally.</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-primary ml-1">Full Name</label>
                                            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student or Owner Name" className="w-full px-5 py-4 rounded-2xl border border-border-light bg-surface-alt/50 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-primary ml-1">Email Address</label>
                                            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="w-full px-5 py-4 rounded-2xl border border-border-light bg-surface-alt/50 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-primary ml-1">Subject</label>
                                        <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What can we help you with?" className="w-full px-5 py-4 rounded-2xl border border-border-light bg-surface-alt/50 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-primary ml-1">Detailed Message</label>
                                        <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Explain your request in detail..." className="w-full px-5 py-4 rounded-2xl border border-border-light bg-surface-alt/50 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all resize-none" />
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
                                    <Button type="submit" size="xl" className="w-full rounded-2xl shadow-xl shadow-primary-500/20 py-5 text-lg" loading={isSubmitting} disabled={isSubmitting}>
                                        <FiSend size={20} /> {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <div className="h-full min-h-[500px] rounded-[2rem] overflow-hidden border border-border-light shadow-inner relative group">
                                <div className="absolute inset-0 bg-primary-900/10 pointer-events-none z-10 group-hover:bg-transparent transition-colors duration-500" />
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53004.95712576965!2d73.19268!3d34.14674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38de31904e312e2d%3A0x5a82b71fd504cbee!2sAbbottabad%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '500px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Roomzy Office Location — Abbottabad, KPK"
                                />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl z-20 border border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                                            <FiMapPin />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text-primary">Our Local HQ</p>
                                            <p className="text-xs text-text-secondary">Mandian, Abbottabad, Hazara</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        </div>
    );
}
