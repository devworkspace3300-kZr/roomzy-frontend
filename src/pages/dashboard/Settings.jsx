import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiLock, FiBell, FiShield, FiSave, FiX } from 'react-icons/fi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getTabsByRole } from '../../constants/tabs';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const SETTINGS_TABS = [
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
];

export default function Settings() {
    const { user, updateUser, token } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        city: user?.city || '',
        email: user?.email || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                city: user.city || '',
                email: user.email || '',
            });
            if (user.profileImageUrl) {
                setImagePreview(user.profileImageUrl);
            }
        }
    }, [user]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size must be less than 2MB');
                return;
            }
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // 1. Upload image if changed
            let imageUrl = user.profileImageUrl;
            if (profileImage) {
                const uploadData = new FormData();
                uploadData.append('image', profileImage);
                const uploadRes = await api.post('/users/profile/image', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data?.data?.imageUrl;
                // Update context immediately
                if (uploadRes.data?.data?.user) {
                    updateUser(uploadRes.data.data.user);
                }
            }

            // 2. Update profile data
            const response = await api.patch('/users/profile', {
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                profileImageUrl: imageUrl
            });

            // Update local auth state to keep UI in sync
            if (response.data?.data) {
                updateUser(response.data.data); 
            }
            
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const roleTabs = getTabsByRole(user?.role);

    return (
        <DashboardLayout tabs={roleTabs} activeTab="settings" setActiveTab={() => {}}>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Account Settings</h2>
                        <p className="text-gray-500 mt-1 font-medium">Manage your personal information and security preferences.</p>
                    </div>
                </div>

                {/* Settings Navigation */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
                    {SETTINGS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'bg-[#0B1A30] text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-[#0B1A30] hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {activeTab === 'profile' && (
                        <div className="p-8 sm:p-12">
                            <form onSubmit={handleUpdateProfile} className="space-y-10">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser size={48} className="text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-3 bg-[#0B1A30] text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                            <FiCamera size={18} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="text-lg font-black text-[#0B1A30] tracking-tight">Profile Photo</h4>
                                        <p className="text-sm text-gray-400 mt-1 font-medium">Upload a professional photo. PNG or JPG, max 2MB.</p>
                                        {profileImage && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setProfileImage(null); setImagePreview(user?.profileImageUrl || null); }}
                                                className="mt-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 flex items-center gap-1 justify-center sm:justify-start"
                                            >
                                                <FiX /> Remove Pending Image
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B1A30]" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0B1A30] focus:ring-4 focus:ring-[#0B1A30]/5 focus:border-[#0B1A30] focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 opacity-60">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Locked)</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full pl-12 pr-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B1A30]" />
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0B1A30] focus:ring-4 focus:ring-[#0B1A30]/5 focus:border-[#0B1A30] focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current City</label>
                                        <div className="relative group">
                                            <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B1A30]" />
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0B1A30] focus:ring-4 focus:ring-[#0B1A30]/5 focus:border-[#0B1A30] focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex justify-end">
                                    <Button 
                                        type="submit" 
                                        loading={loading}
                                        className="bg-[#0B1A30] hover:bg-gray-800 text-xs font-black uppercase tracking-widest py-4 px-10 shadow-xl shadow-[#0B1A30]/20"
                                    >
                                        <FiSave className="mr-2" /> Save Profile Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                                <FiLock size={32} className="text-gray-300" />
                            </div>
                            <h4 className="text-xl font-black text-[#0B1A30] tracking-tight">Security & Password</h4>
                            <p className="text-gray-400 max-w-sm mx-auto font-medium">Update your password and manage two-factor authentication for maximum account safety.</p>
                            <Button variant="outline" className="border-gray-200 text-xs font-black uppercase tracking-widest">Update Security Keys</Button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                                <FiBell size={32} className="text-gray-300" />
                            </div>
                            <h4 className="text-xl font-black text-[#0B1A30] tracking-tight">Notification Preference</h4>
                            <p className="text-gray-400 max-w-sm mx-auto font-medium">Configure how you receive booking alerts and system updates via email and push.</p>
                            <Button variant="outline" className="border-gray-200 text-xs font-black uppercase tracking-widest">Manage Alerts</Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
