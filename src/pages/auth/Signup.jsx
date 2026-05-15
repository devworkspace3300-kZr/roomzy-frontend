import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../api/authApi';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.jpg';

export default function Signup() {
    const [role, setRole] = useState('student');
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        confirmPassword: '',
        gender: '', // for students
        city: '',   // for owners
        businessName: '',
        cnic: '',
        website: ''
    });
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

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);
        setError('');

        const payload = {
            fullName: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: role,
            ...(role === 'student' 
                ? { gender: form.gender } 
                : { 
                    city: form.city, 
                    businessName: form.businessName || undefined, 
                    cnic: form.cnic || undefined 
                  }
            )
        };

        try {
            const result = await registerUser(payload);

            if (result.success) {
                login(result.data.token, result.data.user);
                toast.success('Account created successfully!');

                if (role === 'student') navigate('/dashboard/student');
                else if (role === 'owner') navigate('/dashboard/owner');
                else navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-surface-alt">
            {/* Left Panel — Premium Dark Decorative (Visual Hero Connection) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gray-900 border-r border-border items-center justify-center p-12">
                {/* Background Image with Blur & Overlays */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522771731478-446370c02507?q=80&w=2070&auto=format&fit=crop"
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
                        Join <span className="text-primary-400">Roomzy</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-gray-300 text-lg leading-relaxed font-medium"
                    >
                        {role === 'student'
                            ? 'Create an account to find verified student hostels, save favorites, and book with confidence.'
                            : 'List your hostel on the most trusted student accommodation platform in Pakistan.'}
                    </motion.p>
                </div>
            </div>

            {/* Right Panel — White Card Form */}
            <div className="flex-1 relative overflow-y-auto h-screen w-full">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1522771731478-446370c02507?q=80&w=600&auto=format&fit=crop" alt="Bg" className="w-full h-full object-cover filter blur-sm opacity-20 fixed" />
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md fixed" />
                </div>

                <div className="min-h-full flex items-center justify-center p-4 py-12 lg:p-12 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-md bg-white/95 lg:bg-transparent lg:shadow-none shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-lg lg:backdrop-blur-none rounded-3xl p-8 lg:p-0 border lg:border-none border-border"
                    >
                        <div className="block lg:hidden mb-6 text-center">
                            <img src={logo} alt="Roomzy" className="w-12 h-12 rounded-xl object-cover mx-auto shadow-sm" />
                        </div>

                        <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">Create account</h1>
                        <p className="text-text-secondary text-sm mb-6">Join Roomzy as a student or hostel owner.</p>

                        {/* Role Toggle */}
                        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 shadow-inner">
                            {['student', 'owner'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${role === r ? 'bg-white shadow-sm text-primary-600 border border-gray-200/50' : 'text-text-muted hover:text-text-primary'}`}
                                >
                                    {r === 'student' ? '🎓 Student' : '🏠 Hostel Owner'}
                                </button>
                            ))}
                        </div>

                        {/* Google Signup */}
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold text-text-primary hover:bg-gray-50 hover:shadow-sm transition-all mb-6">
                            <FcGoogle size={20} />
                            Sign up with Google
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Or</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
                                    <div className="relative group">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input type="text" required value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }} placeholder="Your full name" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Email address</label>
                                    <div className="relative group">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input type="email" required value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }} placeholder="you@ex.com" className="w-full pl-11 pr-3 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Phone</label>
                                    <div className="relative group">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input type="tel" required value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setError(''); }} placeholder="+92 3XX..." className="w-full pl-11 pr-3 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Password</label>
                                    <div className="relative group">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }} placeholder="Min 8 char" className="w-full pl-11 pr-9 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors">
                                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Confirm</label>
                                    <div className="relative group">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input type="password" required value={form.confirmPassword} onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setError(''); }} placeholder="Re-enter" className="w-full pl-11 pr-3 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" />
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

                                {/* Dynamic Fields based on Role */}
                                {role === 'student' ? (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Gender</label>
                                        <select 
                                            required 
                                            value={form.gender} 
                                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-text-primary mb-2">City</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={form.city} 
                                                onChange={(e) => setForm({ ...form, city: e.target.value })} 
                                                placeholder="e.g. Abbottabad" 
                                                className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" 
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-sm font-semibold text-text-primary mb-2">CNIC (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={form.cnic} 
                                                onChange={(e) => setForm({ ...form, cnic: e.target.value })} 
                                                placeholder="13-digit CNIC" 
                                                className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-text-primary mb-2">Business Name (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={form.businessName} 
                                                onChange={(e) => setForm({ ...form, businessName: e.target.value })} 
                                                placeholder="e.g. Dream Hostel" 
                                                className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:bg-white transition-all" 
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-200 cursor-pointer" />
                                <span className="text-xs text-text-secondary leading-relaxed font-medium">I agree to the <a href="#" className="text-primary-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 font-bold hover:underline">Privacy Policy</a></span>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 mt-2 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all" size="lg">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="text-sm text-text-secondary text-center mt-6 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">Log In</Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
