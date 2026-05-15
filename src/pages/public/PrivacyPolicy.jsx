import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiFileText } from 'react-icons/fi';

export default function PrivacyPolicy() {
    return (
        <div className="pt-24 pb-16 bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <div className="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Legal Information</div>
                    <h1 className="text-4xl font-black text-[#0B1A30] tracking-tighter">Privacy Policy</h1>
                    <p className="text-gray-500 font-bold">Last updated: May 15, 2026</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-xl shadow-gray-200/40 space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiShield className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Introduction</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Welcome to Roomzy. We value your privacy and the protection of your personal data. This Privacy Policy explains how we collect, use, and share information when you use our website and services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiLock className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Information We Collect</h2>
                        </div>
                        <div className="space-y-4 text-gray-600 font-medium">
                            <p>We collect information that you provide directly to us, such as when you create an account, list a hostel, or make a booking:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Personal Details:</strong> Name, email address, phone number, and CNIC/ID information for verification.</li>
                                <li><strong>Listing Data:</strong> Hostel names, addresses, pricing, and images.</li>
                                <li><strong>Payment Information:</strong> While we use third-party payment processors (PayFast), we may store transaction IDs and basic billing details.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiEye className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">How We Use Information</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We use the information we collect to provide, maintain, and improve our services, to process transactions, to verify user identities, and to communicate with you about updates or support requests.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiShield className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Data Security</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-[#0B1A30]">
                            <FiFileText className="text-primary-500" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight">Contact Us</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            If you have any questions about this Privacy Policy, please contact our privacy team at <strong>privacy@roomzy.com</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
