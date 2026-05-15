import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function OTPVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            toast.error('Please enter the complete code');
            return;
        }
        toast.success('Verification successful! (Demo)');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-surface-alt">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-card border border-border-light p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                        <FiShield size={24} className="text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">Verify Your Account</h1>
                    <p className="text-text-muted text-sm mb-8">
                        We&apos;ve sent a 6-digit code to your email. Enter it below to verify.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-3 mb-8">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value.replace(/\D/, ''))}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 rounded-xl border-2 border-border text-center text-xl font-bold text-text-primary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                                />
                            ))}
                        </div>

                        <Button type="submit" className="w-full" size="lg">Verify</Button>
                    </form>

                    <p className="text-sm text-text-muted mt-6">
                        Didn&apos;t receive the code?{' '}
                        <button className="text-primary-600 font-semibold hover:text-primary-700" onClick={() => toast.success('Code resent!')}>
                            Resend
                        </button>
                    </p>

                    <div className="mt-4 pt-4 border-t border-border-light">
                        <Link to="/login" className="text-sm text-text-muted hover:text-primary-600 transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
