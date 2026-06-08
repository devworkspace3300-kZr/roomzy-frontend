import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiTrash2, FiEdit2, FiArrowLeft, FiCheck, 
    FiImage, FiUploadCloud, FiShield, FiWind, FiPlusCircle, FiLayers 
} from 'react-icons/fi';
import { LuBed } from 'react-icons/lu';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { OWNER_TABS } from '../../../constants/tabs';

const ROOM_TYPES = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'triple', label: 'Triple' },
    { value: 'dormitory', label: 'Dormitory' },
    { value: 'sharing', label: 'Sharing' },
];

const EMPTY_FORM = {
    roomType: 'single',
    roomNumber: '',
    roomName: '',
    floorNumber: '',
    totalBeds: 1,
    pricePerMonth: '',
    securityDeposit: 0,
    hasAttachedBathroom: false,
    hasAc: false,
    description: '',
    images: []
};

export default function ManageRooms() {
    const { hostelId } = useParams();
    const navigate = useNavigate();
    const [hostel, setHostel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    
    // Media handling
    const [tempImages, setTempImages] = useState([]); // Files
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        if (hostelId) {
            fetchData();
        }
    }, [hostelId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('Fetching hostel data for:', hostelId);
            const [hostelRes, roomsRes] = await Promise.all([
                api.get(`/hostels/${hostelId}`),
                api.get(`/rooms/manage?hostelId=${hostelId}`),
            ]);
            
            console.log('Hostel response:', hostelRes.data);
            console.log('Rooms response:', roomsRes.data);

            setHostel(hostelRes.data?.data);
            setRooms(roomsRes.data?.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setTempImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeTempImage = (index) => {
        setTempImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const openAddForm = () => {
        setEditingRoom(null);
        setForm(EMPTY_FORM);
        setTempImages([]);
        setImagePreviews([]);
        setShowForm(true);
    };

    const openEditForm = (room) => {
        setEditingRoom(room);
        setForm({
            roomType: room.roomType,
            roomNumber: room.roomNumber || '',
            roomName: room.roomName || '',
            floorNumber: room.floorNumber || '',
            totalBeds: room.totalBeds,
            pricePerMonth: room.pricePerMonth,
            securityDeposit: room.securityDeposit || 0,
            hasAttachedBathroom: room.hasAttachedBathroom || false,
            hasAc: room.hasAc || false,
            description: room.description || '',
            images: room.images?.map(img => img.imageUrl) || []
        });
        setTempImages([]);
        setImagePreviews(room.images?.map(img => img.imageUrl) || []);
        setShowForm(true);
    };

    const validateForm = () => {
        if (!form.roomType) {
            toast.error('Room category is required');
            return false;
        }
        if (form.floorNumber && isNaN(Number(form.floorNumber))) {
            toast.error('Floor number must be a valid number');
            return false;
        }
        if (!form.totalBeds || isNaN(Number(form.totalBeds)) || Number(form.totalBeds) < 1) {
            toast.error('Physical Bed Count must be at least 1');
            return false;
        }
        if (!form.pricePerMonth || isNaN(Number(form.pricePerMonth)) || Number(form.pricePerMonth) < 0) {
            toast.error('Monthly Rent must be a valid positive number');
            return false;
        }
        if (form.securityDeposit && isNaN(Number(form.securityDeposit))) {
            toast.error('Security Deposit must be a valid number');
            return false;
        }
        
        // Total images count check (previously uploaded urls + new tempImages files)
        const totalImagesCount = (editingRoom ? form.images.length : 0) + tempImages.length;
        if (totalImagesCount < 2) {
            toast.error(`Please upload at least 2 photos for the room gallery (currently ${totalImagesCount} selected)`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const toastId = toast.loading('Uploading room images...');
        
        try {
            // 1. Upload new images if any
            let uploadedUrls = editingRoom ? [...form.images] : [];
            
            if (tempImages.length > 0) {
                for (let i = 0; i < tempImages.length; i++) {
                    const file = tempImages[i];
                    const uploadData = new FormData();
                    uploadData.append('image', file);
                    
                    toast.loading(`Uploading room image ${i + 1} of ${tempImages.length}...`, { id: toastId });
                    
                    try {
                        const res = await api.post('/hostels/image', uploadData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        const url = res.data?.data?.imageUrl;
                        if (!url) {
                            throw new Error('Image URL is missing in response');
                        }
                        uploadedUrls.push(url);
                    } catch (uploadErr) {
                        console.error(`Error uploading room image #${i + 1}:`, uploadErr);
                        const serverMsg = uploadErr.response?.data?.message;
                        throw new Error(`Room image #${i + 1} (${file.name}) failed to upload: ${serverMsg || uploadErr.message}`);
                    }
                }
            }

            if (uploadedUrls.length < 2) {
                throw new Error('Minimum 2 images required for room listing');
            }

            toast.loading('Saving room specification...', { id: toastId });

            const payload = {
                ...form,
                hostelId,
                floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
                totalBeds: Number(form.totalBeds),
                pricePerMonth: Number(form.pricePerMonth),
                securityDeposit: Number(form.securityDeposit),
                images: uploadedUrls
            };

            if (editingRoom) {
                await api.patch(`/rooms/${editingRoom.id}`, payload);
                toast.success('Room specifications updated!', { id: toastId });
            } else {
                await api.post('/rooms', payload);
                toast.success('Room added successfully to inventory!', { id: toastId });
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            console.error('Submit error:', err);
            const errRes = err.response?.data?.message;
            const message = Array.isArray(errRes) 
                ? errRes.join(', ') 
                : (errRes || err.message || 'Failed to save room');
            toast.error(message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (roomId) => {
        if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
        try {
            await api.delete(`/rooms/${roomId}`);
            toast.success('Room removed from inventory');
            setRooms(prev => prev.filter(r => r.id !== roomId));
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete room');
        }
    };

    if (!hostelId) {
        return (
            <DashboardLayout tabs={OWNER_TABS} activeTab="hostels" setActiveTab={() => {}}>
                <div className="p-20 text-center">
                    <p className="text-red-500 font-bold uppercase tracking-widest">Error: No Hostel Selected</p>
                    <Button onClick={() => navigate('/dashboard/owner')} className="mt-4">Return to Dashboard</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout tabs={OWNER_TABS} activeTab="hostels" setActiveTab={() => {}}>
            <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <button
                        onClick={() => navigate('/dashboard/owner')}
                        className="p-3 w-fit rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400"
                    >
                        <FiArrowLeft size={22} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-3xl font-black text-[#0B1A30] tracking-tighter">
                                Manage Inventory
                            </h2>
                            {hostel && (
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                    hostel.status === 'verified'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : hostel.status === 'rejected'
                                        ? 'bg-red-50 text-red-500 border border-red-200'
                                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}>
                                    {hostel.status}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            {hostel?.name || 'Loading Property Information...'}
                        </p>
                    </div>
                    <div className="md:ml-auto">
                        {!showForm && (
                            <Button
                                onClick={openAddForm}
                                disabled={hostel?.status !== 'verified'}
                                className={`shadow-xl w-full md:w-auto ${
                                    hostel?.status === 'verified'
                                        ? 'bg-[#0B1A30] hover:bg-gray-800 shadow-[#0B1A30]/20'
                                        : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
                                }`}
                                size="lg"
                            >
                                <FiPlusCircle className="mr-2" /> Add New Room
                            </Button>
                        )}
                    </div>
                </div>

                {/* Verification Warning Alert */}
                {hostel && hostel.status !== 'verified' && (
                    <div className="bg-amber-50 border-2 border-amber-200/60 rounded-[2rem] p-8 flex items-start gap-5 text-amber-900 shadow-sm animate-fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                            <FiShield size={24} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-black uppercase tracking-tight text-amber-950">Property Verification Required</h4>
                            <p className="text-sm text-amber-800/80 leading-relaxed font-semibold">
                                Your hostel listing status is currently <span className="underline font-bold">{hostel.status}</span>. Under platform guidelines, rooms can only be added to fully verified properties. Once our administration team completes the inspection and approves your hostel, you will be authorized to publish rooms and accept student bookings.
                            </p>
                        </div>
                    </div>
                )}

                {/* Add/Edit Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                        >
                            <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                                <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter">
                                    {editingRoom ? 'Edit Room Specification' : 'Define New Room Type'}
                                </h3>
                                <div className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                    Phase 1: Monthly Billing Only
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Category *</label>
                                        <select
                                            value={form.roomType}
                                            onChange={e => setForm({ ...form, roomType: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0B1A30] outline-none appearance-none focus:ring-4 focus:ring-[#0B1A30]/5 transition-all"
                                        >
                                            {ROOM_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Number / Name</label>
                                        <input
                                            type="text" placeholder="e.g. 101-A or Executive-01"
                                            value={form.roomNumber}
                                            onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Floor Number</label>
                                        <input
                                            type="number" min={0} placeholder="e.g. 1"
                                            value={form.floorNumber}
                                            onChange={e => setForm({ ...form, floorNumber: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Bed Count *</label>
                                        <div className="relative">
                                            <LuBed className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number" min={1} required
                                                value={form.totalBeds}
                                                onChange={e => setForm({ ...form, totalBeds: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Rent (PKR) *</label>
                                        <input
                                            type="number" min={1} required
                                            placeholder="e.g. 12000"
                                            value={form.pricePerMonth}
                                            onChange={e => setForm({ ...form, pricePerMonth: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Deposit</label>
                                        <input
                                            type="number" min={0}
                                            placeholder="e.g. 5000"
                                            value={form.securityDeposit}
                                            onChange={e => setForm({ ...form, securityDeposit: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="p-8 bg-gray-50 rounded-[2rem] space-y-6 border border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amenities & Attachments</h4>
                                        <div className="flex gap-4 sm:gap-6">
                                            <button
                                                type="button"
                                                onClick={() => setForm({...form, hasAttachedBathroom: !form.hasAttachedBathroom})}
                                                className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center sm:justify-start gap-3 ${
                                                    form.hasAttachedBathroom ? 'bg-[#0B1A30] text-white border-[#0B1A30] shadow-lg' : 'bg-white text-gray-400 border-gray-100'
                                                }`}
                                            >
                                                <FiShield /> <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Attached Bath</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({...form, hasAc: !form.hasAc})}
                                                className={`flex-1 p-5 rounded-2xl border-2 transition-all flex items-center justify-center sm:justify-start gap-3 ${
                                                    form.hasAc ? 'bg-[#0B1A30] text-white border-[#0B1A30] shadow-lg' : 'bg-white text-gray-400 border-gray-100'
                                                }`}
                                            >
                                                <FiWind /> <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">A/C Present</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Gallery (Min 2)</label>
                                            <label className="text-[9px] font-black text-[#0B1A30] bg-gray-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                                                <FiUploadCloud className="inline mr-2" /> Select Photos
                                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                            {imagePreviews.map((src, i) => (
                                                <div key={i} className="min-w-[100px] h-[100px] rounded-2xl overflow-hidden relative group border-4 border-white shadow-md shrink-0">
                                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeTempImage(i)}
                                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            ))}
                                            {imagePreviews.length === 0 && (
                                                <div className="w-full h-[100px] rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300">
                                                    <FiImage size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-200 px-10 rounded-2xl">
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={submitting} className="bg-[#0B1A30] hover:bg-gray-800 px-12 shadow-2xl shadow-[#0B1A30]/20 rounded-2xl">
                                        <FiCheck className="mr-2" /> {editingRoom ? 'Update Room Spec' : 'Confirm Room Addition'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rooms List */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-10 border-b border-gray-100 bg-gray-50/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter text-center sm:text-left">Live Inventory ({rooms.length})</h3>
                        <div className="flex gap-3">
                             <span className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-widest"><FiCheck /> Automated Availability Active</span>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-[#0B1A30] border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Records...</p>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="p-24 text-center space-y-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                                <LuBed size={40} className="text-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-[#0B1A30] uppercase tracking-tighter text-2xl">Your Inventory is Empty</p>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto text-center">Start by adding your first room type to begin receiving student bookings.</p>
                            </div>
                            <Button onClick={openAddForm} className="bg-[#0B1A30] shadow-xl shadow-[#0B1A30]/20">Create First Room</Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {rooms.map(room => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-6 sm:p-10 hover:bg-gray-50/30 transition-colors flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
                                >
                                    <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-lg border-4 border-white shrink-0 mx-auto md:mx-0">
                                        <img src={room.images?.[0]?.imageUrl || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-3 text-center md:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <span className="font-black text-2xl text-[#0B1A30] tracking-tighter">
                                                {ROOM_TYPES.find(t => t.value === room.roomType)?.label || 'Standard'} Room
                                                {room.roomNumber ? ` (${room.roomNumber})` : ''}
                                            </span>
                                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                                room.availableBeds > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                            }`}>
                                                {room.availableBeds > 0 ? `${room.availableBeds} Beds Free` : 'Room Full'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <FiLayers /> Floor {room.floorNumber || 0}
                                            </div>
                                            {room.hasAttachedBathroom && <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest"><FiShield /> Attached Bath</div>}
                                            {room.hasAc && <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest"><FiWind /> AC Room</div>}
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right space-y-1">
                                        <div className="text-2xl font-black text-[#0B1A30]">
                                            Rs. {typeof room.pricePerMonth === 'number' ? room.pricePerMonth.toLocaleString() : room.pricePerMonth}
                                        </div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Per Student / Month</div>
                                        {room.securityDeposit > 0 && <div className="text-[9px] font-bold text-emerald-600">Deposit: Rs. {room.securityDeposit.toLocaleString()}</div>}
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => openEditForm(room)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#0B1A30] hover:border-gray-300 transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <FiEdit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
