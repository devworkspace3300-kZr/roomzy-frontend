import { motion } from 'framer-motion';
import { FiActivity, FiTruck, FiCheckSquare, FiLifeBuoy } from 'react-icons/fi';

export default function ServicePolicy() {
    return (
        <div className="pt-24 pb-16 bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Legal Information</div>
                    <h1 className="text-4xl font-black text-[#0B1A30] tracking-tighter">Service & Delivery Policy</h1>
                    <p className="text-gray-500 font-bold">Last updated: May 15, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-gray-200/40 space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiActivity className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Service Description</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Roomzy provides an online platform that connects students seeking accommodation with hostel owners. Our "Service" refers to the facilitation of search, verification, and secure booking management through our web application.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiTruck className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Delivery of Service</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Since Roomzy provides digital and accommodation services, "Delivery" occurs instantly upon the confirmation of a booking. Students will receive a digital Booking Voucher via email and in their dashboard once the payment is confirmed via PayFast.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiCheckSquare className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Verification Standards</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We ensure that every hostel listed on our platform undergoes a verification process. While we strive for 100% accuracy, the "Service" depends on the data provided by owners. If a hostel does not match the description upon arrival, students are covered under our Refund Policy.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiLifeBuoy className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Support & Maintenance</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Our platform is available 24/7. In the event of scheduled maintenance or technical outages, we will notify users via the website. Customer support is available from Monday to Saturday, 9 AM to 6 PM (PKT).
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
