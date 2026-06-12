import { motion } from 'framer-motion';
import { FiTarget, FiHeart, FiGlobe, FiUsers, FiShield, FiAward, FiCheckCircle } from 'react-icons/fi';
import { STATS } from '../../constants';
import ScrollReveal from '../../components/shared/ScrollReveal';
import Counter from '../../components/ui/Counter';

export default function About() {
    const values = [
        { icon: FiShield, title: 'Trust & Transparency', desc: 'Every listing is personally verified on-site by our team. What you see is exactly what you get.' },
        { icon: FiHeart, title: 'Student First', desc: 'Built by developers who understand the struggle of relocation. Every feature is designed for your peace of mind.' },
        { icon: FiAward, title: 'Quality Standards', desc: 'We maintain strict hygiene and safety benchmarks that every listed hostel must meet to stay on our platform.' },
        { icon: FiUsers, title: 'Empowering Communities', desc: 'We help local hostel owners in Abbottabad and Mansehra digitize their business and reach students directly.' },
        { icon: FiTarget, title: 'Hyper-Local Focus', desc: 'We aren\'t trying to be everywhere at once. We are mastering student living in Abbottabad and Mansehra first.' },
        { icon: FiGlobe, title: 'Future of Housing', desc: 'Continuously improving the platform with smart matching and real-time availability tracking.' },
    ];

    const visionPoints = [
        { title: 'Safe Sanctuaries', desc: 'Creating a network where every student apartment or hostel feels like a secondary home.' },
        { title: 'Tech-Driven Living', desc: 'Implementing digital attendance, fee management, and complaint tracking for all partner hostels.' },
        { title: 'Zero Brokerage', desc: 'Eliminating middle-men to ensure students get the best possible rates directly from owners.' },
    ];

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="gradient-hero py-24 sm:py-32 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
                <div className="relative max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6"
                    >
                        Our Mission & Vision
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                    >
                        Redefining Student Living <br className="hidden sm:block" /> in <span className="gradient-text">Hazara Division</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-primary-100/90 text-lg sm:text-xl mt-8 leading-relaxed max-w-2xl mx-auto"
                    >
                        To provide every student in Abbottabad and Mansehra with a safe, verified, and transparent home away from home — so they can focus entirely on achieving their dreams.
                    </motion.p>
                </div>
            </section>

            {/* Story & Local Impact */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <ScrollReveal direction="left">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-primary-500 text-sm font-bold uppercase tracking-widest mb-3">Our Origins</p>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6 leading-tight">Focusing on where it matters most: Abbottabad & Mansehra</h2>
                                    <div className="space-y-6 text-text-secondary text-lg leading-relaxed">
                                        <p>
                                            Every year, the Hazara region becomes a beacon for thousands of bright minds joining institutions across Abbottabad and Mansehra. But the excitement of education is often overshadowed by the stress of finding a decent place to live.
                                        </p>
                                        <p>
                                            Roomzy was born right here. We saw students and their families traveling for days, dealing with deceptive advertisements, and settling for substandard living conditions just to be near their place of study.
                                        </p>
                                        <p className="font-medium text-text-primary px-6 py-4 border-l-4 border-primary-500 bg-primary-50/50 rounded-r-2xl">
                                            "Our mission isn't just to list hostels. It's to enforce a new standard of living for the next generation of Pakistan's leaders."
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">100% In-Person Verification</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">Direct Owner Connectivity</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">Verified Student Reviews</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">Safety First Protocol</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal direction="right">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary-500/10 rounded-[3rem] blur-2xl -z-10" />
                                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop" alt="Students studying together" className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-[200px] hidden sm:block">
                                    <p className="text-4xl font-bold gradient-text">Hazara's</p>
                                    <p className="text-sm text-text-muted mt-1">#1 Student Housing Platform</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Vision Sections */}
            <section className="py-24 bg-surface-alt relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-primary-500 text-sm font-bold uppercase tracking-widest mb-3">Our Vision</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">What We're Building for You</h2>
                        </div>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-3 gap-8">
                        {visionPoints.map((point, i) => (
                            <ScrollReveal key={point.title} delay={i * 0.1}>
                                <div className="p-8 rounded-3xl bg-white shadow-sm border border-border-light hover:shadow-xl transition-all h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
                                        <span className="text-primary-500 font-bold text-xl">0{i + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-3">{point.title}</h3>
                                    <p className="text-text-secondary leading-relaxed">{point.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-white border-y border-border-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {STATS.map((stat, i) => (
                            <ScrollReveal key={stat.label} delay={i * 0.1}>
                                <div className="text-center">
                                    <p className="text-4xl sm:text-5xl font-black gradient-text mb-2 tracking-tight">
                                        <Counter value={stat.value} />
                                    </p>
                                    <p className="text-text-muted text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-primary-500 text-sm font-bold uppercase tracking-widest mb-3">Core Philosophy</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">The Values That Drive Us</h2>
                        </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map(({ icon: Icon, title, desc }, i) => (
                            <ScrollReveal key={title} delay={i * 0.08}>
                                <div className="p-10 rounded-[2rem] bg-white border border-border-light shadow-sm hover:shadow-card-hover transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Icon size={120} />
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Icon size={32} className="text-primary-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
                                    <p className="text-text-muted leading-relaxed">{desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-surface-dark text-white text-center rounded-[3rem] mx-4 sm:mx-8 mb-12 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary-600/10" />
                <div className="relative z-10 max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to find your home in Abbottabad or Mansehra?</h2>
                    <p className="text-white/60 text-lg mb-10">Join thousands of students who trust Roomzy for their accommodation needs.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.a
                            href="/listings"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-10 py-4 gradient-primary rounded-2xl font-bold text-lg shadow-xl"
                        >
                            Browse Hostels
                        </motion.a>
                        <motion.a
                            href="/signup"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-lg transition-colors"
                        >
                            Join as Owner
                        </motion.a>
                    </div>
                </div>
            </section>
        </div>
    );
}
