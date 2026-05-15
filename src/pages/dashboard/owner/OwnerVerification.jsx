import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiCheckCircle, FiFileText, FiUser, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import { OWNER_TABS } from '../../../constants/tabs';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

export default function OwnerVerification() {
    const { user, refreshUser, verificationStatus } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [files, setFiles] = useState({
        cnic_front: null,
        cnic_back: null,
        property_ownership: null,
        utility_bill: null
    });

    const [previews, setPreviews] = useState({
        cnic_front: null,
        cnic_back: null,
        property_ownership: null,
        utility_bill: null
    });

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [key]: file }));
            setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!files.cnic_front || !files.cnic_back || !files.property_ownership) {
            toast.error('Please upload all mandatory documents');
            return;
        }

        const formData = new FormData();
        formData.append('cnic_front', files.cnic_front);
        formData.append('cnic_back', files.cnic_back);
        formData.append('property_ownership', files.property_ownership);
        if (files.utility_bill) formData.append('utility_bill', files.utility_bill);

        setLoading(true);
        try {
            const res = await api.post('/owner/verification-documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success('Documents submitted successfully! Your account is now under review.', {
                    duration: 5000,
                    icon: '🚀'
                });
                await refreshUser();
                setTimeout(() => {
                    navigate('/dashboard/owner');
                }, 2000);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to upload documents';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const FileUploadField = ({ id, label, required, subtitle }) => (
        <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                <input 
                    type="file" 
                    id={id}
                    onChange={(e) => handleFileChange(e, id)}
                    accept="image/*,application/pdf"
                    className="hidden"
                />
                <label 
                    htmlFor={id}
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${previews[id] ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50/50 border-gray-100 hover:border-primary-300 hover:bg-white shadow-sm'}`}
                >
                    {previews[id] ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                                <FiCheckCircle className="text-emerald-500" size={24} />
                            </div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Document Uploaded</p>
                            <p className="text-[9px] text-emerald-400 font-bold mt-1 truncate max-w-[200px]">{files[id].name}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100 group-hover:scale-110 transition-transform">
                                <FiUploadCloud className="text-gray-400 group-hover:text-primary-500" size={24} />
                            </div>
                            <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">{subtitle || 'Choose File'}</p>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">JPG, PNG, PDF (Max 5MB)</p>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );

    return (
        <DashboardLayout tabs={OWNER_TABS} activeTab="verification">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button 
                            onClick={() => navigate('/dashboard/owner')}
                            className="flex items-center gap-2 text-gray-400 hover:text-[#0B1A30] transition-colors mb-4 font-black text-[10px] uppercase tracking-widest"
                        >
                            <FiArrowLeft /> Back to Dashboard
                        </button>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Account Verification</h2>
                        <p className="text-gray-500 mt-1 font-medium italic">Step-by-step identity and property validation</p>
                    </div>
                </div>

                {verificationStatus === 'under_review' ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-gray-100 border-b-[6px] border-b-primary-500">
                        <div className="w-24 h-24 bg-primary-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FiLoader className="text-primary-500 animate-spin" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[#0B1A30] uppercase tracking-tighter mb-4">Under Review</h3>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed font-medium">
                            Your documents have been submitted successfully. Our Hazara team is now reviewing your application. You will receive an email once your physical inspection is scheduled.
                        </p>
                        <Button 
                            className="mt-10 bg-[#0B1A30]"
                            onClick={() => navigate('/dashboard/owner')}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Identity */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <FiUser size={120} />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><FiUser size={18} /></div>
                                <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">Owner Identity</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FileUploadField id="cnic_front" label="CNIC Front" required subtitle="Upload CNIC Front" />
                                <FileUploadField id="cnic_back" label="CNIC Back" required subtitle="Upload CNIC Back" />
                            </div>
                        </div>

                        {/* Section 2: Property */}
                        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <FiFileText size={120} />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><FiFileText size={18} /></div>
                                <h3 className="text-md font-black text-[#0B1A30] uppercase tracking-tighter">Property Documentation</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FileUploadField id="property_ownership" label="Ownership Deed / Agreement" required subtitle="Upload Deed" />
                                <FileUploadField id="utility_bill" label="Utility Bill (Electricity/Gas)" subtitle="Upload Bill" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-[#0B1A30] hover:bg-gray-800 px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            >
                                {loading ? 'Uploading Documents...' : 'Submit for Verification'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}
