import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import { FAQ_DATA } from '../../constants';
import ScrollReveal from '../../components/shared/ScrollReveal';

function FAQItem({ item, isOpen, onToggle }) {
    return (
        <div className="border border-border-light rounded-2xl overflow-hidden bg-white hover:shadow-card transition-shadow">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
            >
                <span className="font-semibold text-text-primary">{item.question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                >
                    <FiChevronDown size={20} className="text-text-muted" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="px-6 pb-5 text-sm text-text-secondary leading-relaxed">{item.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);
    const [search, setSearch] = useState('');

    const filtered = FAQ_DATA.filter(
        (item) =>
            item.question.toLowerCase().includes(search.toLowerCase()) ||
            item.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="gradient-hero py-20 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative max-w-3xl mx-auto px-4">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold">
                        Frequently Asked Questions
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-100/80 text-lg mt-4">
                        Everything you need to know about Roomzy. Can&apos;t find your answer? Contact us!
                    </motion.p>

                    {/* Search */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 max-w-md mx-auto relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 shadow-lg"
                        />
                    </motion.div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="space-y-3">
                        {filtered.map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.05}>
                                <FAQItem
                                    item={item}
                                    isOpen={openIndex === i}
                                    onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                                />
                            </ScrollReveal>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-text-muted">No questions match your search.</p>
                        </div>
                    )}

                    {/* CTA */}
                    <ScrollReveal>
                        <div className="mt-16 text-center p-8 rounded-2xl bg-primary-50 border border-primary-100">
                            <h3 className="text-xl font-bold text-text-primary mb-2">Still have questions?</h3>
                            <p className="text-text-muted text-sm mb-4">Our team is happy to help. Reach out to us anytime.</p>
                            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                                Contact Support
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
