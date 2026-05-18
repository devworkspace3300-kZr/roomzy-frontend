import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUsers, FiHome, FiShield } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpg';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '', website: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Honeypot check
        if (form.website) {
            console.log('Bot detected');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await loginUser(form.email, form.password);
            
            if (result.success) {
                login(result.data.token, result.data.user);
                toast.success('Login successful!');

                const role = result.data.user.role;
                if (role === 'student') navigate('/dashboard/student');
                else if (role === 'owner') navigate('/dashboard/owner');
                else if (role === 'admin') navigate('/dashboard/admin');
                else navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const dashboardLinks = [
        { label: 'Student Dashboard', path: '/dashboard/student', icon: FiUsers, color: 'bg-primary-50 text-primary-600 border-primary-100' },
        { label: 'Owner Dashboard', path: '/dashboard/owner', icon: FiHome, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: 'Admin Dashboard', path: '/dashboard/admin', icon: FiShield, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    ];

    return (
        <div className="min-h-screen flex bg-surface-alt">
            {/* Left Panel — Premium Dark Decorative (Visual Hero Connection) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900 border-r border-border items-center justify-center p-12">
                {/* Background Image with Blur & Overlays */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1555854817-27606fce277a?q=80&w=2070&auto=format&fit=crop"
                        alt="Students in Hostel"
                        className="w-full h-full object-cover filter blur-[4px] scale-105 opacity-50"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-primary-900/60" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/15 rounded-full blur-[100px] opacity-70 pointer-events-none" />
                </div>
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                <div className="relative z-10 text-center text-white max-w-md flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                        className="mb-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/10 border-b-white/5"
                    >
                        <img src={logo} alt="Roomzy" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-[800] leading-tight mb-4 tracking-tight"
                    >
                        Welcome to <span className="text-primary-400">Roomzy</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-gray-300 text-lg leading-relaxed font-medium"
                    >
                        Pakistan's trusted platform for verified student hostels and accommodations.
                    </motion.p>
                </div>
            </div>

            {/* Right Panel — White Card Form */}
            <div className="flex-1 relative overflow-y-auto h-screen w-full">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1555854817-27606fce277a?q=80&w=600&auto=format&fit=crop" alt="Bg" className="w-full h-full object-cover filter blur-sm opacity-20 fixed" />
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md fixed" />
                </div>

                <div className="min-h-full flex items-center justify-center p-4 py-12 lg:p-12 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-md bg-white/95 lg:bg-transparent lg:shadow-none shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-lg lg:backdrop-blur-none rounded-3xl p-8 lg:p-0 border lg:border-none border-border"
                    >
                        <div className="block lg:hidden mb-8 text-center">
                            <img src={logo} alt="Roomzy" className="w-12 h-12 rounded-xl object-cover mx-auto shadow-sm" />
                        </div>

                        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Log in</h1>
                        <p className="text-text-secondary text-sm mb-8">Access your account to manage bookings.</p>



                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">Email address</label>
                                <div className="relative group">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input type="email" required value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-text-primary">Password</label>
                                    <button 
                                        type="button"
                                        onClick={() => toast('Please contact the platform administrator or send a direct message for password recovery.', {
                                            icon: '📧',
                                            duration: 6000,
                                        })}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-bold hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }} placeholder="••••••••" className="w-full pl-11 pr-11 py-3.5 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors">
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
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
                            <Button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 mt-2 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all" size="lg">
                                {loading ? 'Logging In...' : 'Log In'}
                            </Button>
                        </form>

                        <p className="text-sm text-text-secondary text-center mt-8 font-medium">
                            Don&apos;t have an account?{' '}
                            <Link to="/signup" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">Sign Up</Link>
                        </p>

                        {/* Dashboard Quick Access (Testing) */}
                        {/* <div className="mt-10 pt-8 border-t border-border-light">
                            <p className="text-[10px] text-text-muted text-center mb-4 uppercase tracking-[0.15em] font-bold">Preview Dashboards</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                {dashboardLinks.map(({ label, path, icon: Icon, color }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm ${color}`}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div> */}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
