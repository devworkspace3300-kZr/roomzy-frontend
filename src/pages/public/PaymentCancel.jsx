import { Link } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function PaymentCancel() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-red-500/10 p-12 text-center border border-red-50"
            >
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/20">
                    <FiXCircle className="text-white" size={48} />
                </div>
                
                <h1 className="text-3xl font-black text-[#0B1A30] mb-4 tracking-tighter uppercase">Payment Cancelled</h1>
                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    Your payment process was cancelled or interrupted. No funds have been deducted from your account.
                </p>
                
                <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-3 mb-10 text-left">
                    <FiAlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        If you encountered an error, please try again from the dashboard or contact our support team.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Link 
                        to="/dashboard" 
                        state={{ activeTab: 'bookings' }}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#0B1A30] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-[#0B1A30]/20 group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                    
                    <Link 
                        to="/support" 
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                        Contact Support
                    </Link>
                </div>
                
                <p className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Roomzy Secure Transactions</p>
            </motion.div>
        </div>
    );
}
