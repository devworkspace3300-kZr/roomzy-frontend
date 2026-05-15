import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiArrowRight, FiClock, FiX, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function VerificationBanner() {
    const { verificationStatus, isOwner } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);

    if (!isOwner || !isVisible) return null;

    const config = {
        pending: {
            icon: <FiAlertTriangle className="text-amber-500" />,
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            title: 'Account Verification Required',
            message: 'You need to upload your CNIC and property documents before you can list hostels.',
            actionLabel: 'Verify Now',
            action: () => navigate('/dashboard/owner/verify'),
        },
        under_review: {
            icon: <FiClock className="text-primary-500" />,
            bg: 'bg-primary-50',
            border: 'border-primary-100',
            title: 'Documents Under Review',
            message: 'Our team is currently reviewing your documents. This usually takes 24-48 hours.',
            actionLabel: 'View Status',
            action: () => navigate('/dashboard/owner/verify'),
        },
        rejected: {
            icon: <FiX className="text-red-500" />,
            bg: 'bg-red-50',
            border: 'border-red-100',
            title: 'Verification Rejected',
            message: 'There were issues with your documents. Please review the feedback and re-submit.',
            actionLabel: 'Re-submit Documents',
            action: () => navigate('/dashboard/owner/verify'),
        },
        verified: null
    };

    const current = config[verificationStatus];
    if (!current) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`${current.bg} border-b ${current.border} relative overflow-hidden`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            {current.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">{current.title}</h4>
                            <p className="text-xs text-gray-600 font-medium">{current.message}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={current.action}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
                        >
                            {current.actionLabel} <FiArrowRight />
                        </button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
