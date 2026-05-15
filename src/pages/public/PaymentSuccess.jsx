import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-emerald-500/10 p-12 text-center border border-emerald-50"
            >
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                    <FiCheckCircle className="text-white" size={48} />
                </div>
                
                <h1 className="text-3xl font-black text-[#0B1A30] mb-4 tracking-tighter uppercase">Payment Successful!</h1>
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    Your booking has been confirmed. You can now view your stay details in the student dashboard.
                </p>
                
                <div className="space-y-4">
                    <Link 
                        to="/dashboard" 
                        state={{ activeTab: 'bookings' }}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#0B1A30] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-[#0B1A30]/20 group"
                    >
                        Go to Dashboard <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                        <FiHome /> Back to Home
                    </Link>
                </div>
                
                <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Roomzy Secure Transactions</p>
            </motion.div>
        </div>
    );
}
