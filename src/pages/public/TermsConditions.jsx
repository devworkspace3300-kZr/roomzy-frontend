import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function TermsConditions() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 pb-16 bg-[#F8FAFC]"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Legal Information</div>
                    <h1 className="text-4xl font-black text-[#0B1A30] tracking-tighter">Terms & Conditions</h1>
                    <p className="text-gray-500 font-bold">Last updated: May 15, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-gray-200/40 space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiShield className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Agreement to Terms</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            By accessing or using the Roomzy platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiUsers className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">User Accounts</h2>
                        </div>
                        <div className="space-y-4 text-gray-600 font-medium">
                            <p>To use certain features, you must register for an account. You are responsible for:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Maintaining the confidentiality of your account credentials.</li>
                                <li>Providing accurate, current, and complete information during registration.</li>
                                <li>All activities that occur under your account.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiCheckCircle className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Payments & Bookings</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Bookings are subject to approval by the hostel owner. Once approved, you must complete the payment within the specified time (24 hours) via PayFast. Failure to pay within the deadline will result in automatic cancellation of the booking request.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiInfo className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Hostel Owner Obligations</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Owners must provide accurate listings, honor confirmed bookings, and maintain their properties according to the safety and service standards disclosed on the platform. Roomzy reserves the right to suspend owners who violate these standards.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiShield className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Limitation of Liability</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Roomzy is a platform connecting students and owners. We are not responsible for disputes, physical property conditions, or personal safety beyond the scope of our verification and booking services.
                        </p>
                    </section>
                </div>
            </div>
        </motion.div>
    );
}
