import { motion } from 'framer-motion';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function RefundPolicy() {
    return (
        <div className="pt-24 pb-16 bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Legal Information</div>
                    <h1 className="text-4xl font-black text-[#0B1A30] tracking-tighter">Return & Refund Policy</h1>
                    <p className="text-gray-500 font-bold">Last updated: May 15, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-gray-200/40 space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiRefreshCw className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Booking Cancellations</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            At Roomzy, we strive to ensure a fair process for both students and hostel owners. Since we provide a booking service for physical accommodation, the following refund rules apply to booking deposits and advance payments.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiClock className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Refund Eligibility</h2>
                        </div>
                        <div className="space-y-4 text-gray-600 font-medium">
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Full Refund:</strong> If a cancellation is made at least 7 days before the scheduled move-in date.</li>
                                <li><strong>Partial Refund (50%):</strong> If a cancellation is made between 48 hours and 7 days before the move-in date.</li>
                                <li><strong>No Refund:</strong> If a cancellation is made within 48 hours of the move-in date or after the move-in date has passed.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiAlertCircle className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Service Fees</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Please note that Roomzy's service processing fee (if applicable) is non-refundable as it covers the administrative costs of facilitating the booking and managing the secure payment gateway.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiCheckCircle className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">How to Request a Refund</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            To initiate a refund request, please go to your "My Bookings" dashboard and select the "Cancel Booking" option. Our team will review the request based on the timestamps and process the eligible amount within 5-7 business days to your original payment method via PayFast.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
