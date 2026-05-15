import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        toast.success('Reset link sent! Check your email.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-surface-alt">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-card border border-border-light p-8">
                    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-600 transition-colors mb-6">
                        <FiArrowLeft size={16} /> Back to Login
                    </Link>

                    {!sent ? (
                        <>
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                                <FiMail size={24} className="text-primary-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-text-primary mb-1">Forgot Password?</h1>
                            <p className="text-text-muted text-sm mb-6">No worries! Enter your email and we&apos;ll send you a reset link.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" size="lg">Send Reset Link</Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-5">
                                <FiMail size={28} className="text-accent-500" />
                            </div>
                            <h2 className="text-xl font-bold text-text-primary mb-2">Check Your Email</h2>
                            <p className="text-text-muted text-sm mb-6">
                                We&apos;ve sent a password reset link to <span className="font-semibold text-text-primary">{email}</span>
                            </p>
                            <Button variant="secondary" onClick={() => setSent(false)} className="w-full">
                                Resend Email
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
