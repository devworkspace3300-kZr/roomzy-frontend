import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiHome, FiMapPin, FiList, FiImage, FiCheck, FiArrowRight, 
    FiArrowLeft, FiPlus, FiTrash2, FiInfo, FiLayers, FiUsers, 
    FiCheckCircle, FiUploadCloud, FiYoutube, FiRefreshCw
} from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Button from '../../../components/ui/Button';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { OWNER_TABS } from '../../../constants/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const STEPS = [
    { id: 1, label: 'Basic Info', icon: FiHome },
    { id: 2, label: 'Location', icon: FiMapPin },
    { id: 3, label: 'Facilities', icon: FiList },
    { id: 4, label: 'Gallery', icon: FiImage },
    { id: 5, label: 'Review', icon: FiCheckCircle },
];

export default function ListHostel() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [institutes, setInstitutes] = useState([]);
    const [amenitiesMaster, setAmenitiesMaster] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, verificationStatus } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        genderType: 'boys_only',
        totalFloors: '',
        totalRoomsCount: '',
        city: '',
        area: '',
        fullAddress: '',
        latitude: '',
        longitude: '',
        nearestInstituteId: '',
        startingPrice: '',
        videoUrl: '',
        amenityIds: [],
        coverImage: null,
    });

    const [tempImages, setTempImages] = useState([]); 
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setFetchingData(true);
        setError(null);
        try {
            console.log('Fetching amenities and institutes...');
            
            // Fetch amenities with independent try-catch
            try {
                const amenRes = await api.get('/amenities');
                const amenities = amenRes.data?.data || [];
                setAmenitiesMaster(amenities);
                if (amenities.length === 0) {
                   console.warn('Amenities list is empty. Consider seeding.');
                }
            } catch (err) {
                console.error('Amenities fetch failed:', err);
                toast.error('Could not load facilities list. Please refresh.');
                setError('amenities');
            }
            
            // Fetch institutes independently
            try {
                const instRes = await api.get('/institutes');
                setInstitutes(instRes.data?.data || []);
            } catch (err) {
                console.error('Institutes fetch failed:', err);
            }
        } catch (err) {
            console.error('General data fetch error:', err);
        } finally {
            setFetchingData(false);
        }
    };

    // Robust Institute Fetching Strategy
    useEffect(() => {
        const fetchLocalizedInstitutes = async () => {
            if (!formData.area && !formData.city) return;

            try {
                if (formData.area) {
                    const resArea = await api.get(`/institutes?area=${formData.area}`);
                    if (resArea.data?.data && resArea.data.data.length > 0) {
                        setInstitutes(resArea.data.data);
                        return;
                    }
                }

                if (formData.city) {
                    const resCity = await api.get(`/institutes?city=${formData.city}`);
                    setInstitutes(resCity.data?.data || []);
                }
            } catch (error) {
                console.error('Localization strategy failed:', error);
            }
        };

        const timer = setTimeout(fetchLocalizedInstitutes, 500);
        return () => clearTimeout(timer);
    }, [formData.area, formData.city]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        const validFiles = [];
        for (const file of files) {
            if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
                toast.error(`Invalid format: ${file.name}. Only JPG, PNG, GIF, and JFIF are allowed.`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File too large: ${file.name}. Max size is 5MB.`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            setTempImages(prev => [...prev, ...validFiles]);
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setTempImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (id) => {
        setFormData(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(id)
                ? prev.amenityIds.filter(aId => aId !== id)
                : [...prev.amenityIds, id]
        }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.name.trim()) {
                    toast.error('Property name is required');
                    return false;
                }
                if (!formData.description.trim()) {
                    toast.error('Description is required');
                    return false;
                }
                if (formData.description.trim().length < 100) {
                    toast.error(`Description must be at least 100 characters long (currently ${formData.description.trim().length} chars)`);
                    return false;
                }
                break;
            case 2:
                if (!formData.city.trim()) {
                    toast.error('City is required');
                    return false;
                }
                if (!formData.area.trim()) {
                    toast.error('Area is required');
                    return false;
                }
                if (!formData.fullAddress.trim()) {
                    toast.error('Full address is required');
                    return false;
                }
                if (!formData.latitude || isNaN(Number(formData.latitude))) {
                    toast.error('Please enter a valid Latitude number');
                    return false;
                }
                if (!formData.longitude || isNaN(Number(formData.longitude))) {
                    toast.error('Please enter a valid Longitude number');
                    return false;
                }
                break;
            case 3:
                // Facilities are optional on the backend
                break;
            case 4:
                if (tempImages.length < 4) {
                    toast.error(`Please upload at least 4 photos for the hostel gallery (currently ${tempImages.length} uploaded)`);
                    return false;
                }
                break;
            case 5:
                if (!formData.startingPrice || isNaN(Number(formData.startingPrice)) || Number(formData.startingPrice) <= 0) {
                    toast.error('Please enter a valid monthly starting rent greater than 0');
                    return false;
                }
                break;
            default:
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        // Validate all steps before submitting
        for (let step = 1; step <= STEPS.length; step++) {
            if (!validateStep(step)) {
                setCurrentStep(step);
                return;
            }
        }

        setLoading(true);
        const toastId = toast.loading('Uploading images...');
        
        try {
            const uploadedUrls = [];
            for (let i = 0; i < tempImages.length; i++) {
                const file = tempImages[i];
                const uploadData = new FormData();
                uploadData.append('image', file);
                
                toast.loading(`Uploading image ${i + 1} of ${tempImages.length}...`, { id: toastId });
                
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
                    console.error(`Error uploading image #${i + 1}:`, uploadErr);
                    const serverMsg = uploadErr.response?.data?.message;
                    throw new Error(`Image #${i + 1} (${file.name}) failed to upload: ${serverMsg || uploadErr.message}`);
                }
            }

            toast.loading('Saving hostel listing...', { id: toastId });

            const payload = {
                ...formData,
                startingPrice: Number(formData.startingPrice),
                totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
                totalRoomsCount: formData.totalRoomsCount ? Number(formData.totalRoomsCount) : undefined,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                nearestInstituteId: formData.nearestInstituteId || undefined,
                cityId: formData.cityId || undefined,
                images: uploadedUrls,
                coverImage: uploadedUrls[0],
                isDraft: false
            };

            await api.post('/hostels', payload);
            toast.success('Hostel submitted successfully!', { id: toastId });
            navigate('/dashboard/owner');
        } catch (error) {
            console.error('Submit error:', error);
            const errRes = error.response?.data?.message;
            const message = Array.isArray(errRes) 
                ? errRes.join(', ') 
                : (errRes || error.message || 'Failed to submit hostel');
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout tabs={OWNER_TABS} activeTab="hostels" setActiveTab={() => {}}>
            {verificationStatus !== 'verified' ? (
                <div className="max-w-4xl mx-auto py-20 animate-fade-in px-4">
                    <div className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-gray-100 border-b-[8px] border-b-amber-500">
                        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FiInfo className="text-amber-500" size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-[#0B1A30] uppercase tracking-tighter mb-4">Verification Required</h3>
                        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed font-medium text-lg">
                            To ensure platform integrity, you must complete your account verification before listing properties.
                        </p>
                        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                                className="bg-[#0B1A30] hover:bg-gray-800 px-10 py-5"
                                onClick={() => navigate('/dashboard/owner/verification')}
                            >
                                Submit Documents Now
                            </Button>
                            <Button 
                                variant="outline"
                                className="px-10 py-5 border-gray-200"
                                onClick={() => navigate('/dashboard/owner')}
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12 px-4">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-black text-[#0B1A30] tracking-tight">List Property</h2>
                    <p className="text-gray-500 font-bold max-w-lg mx-auto leading-relaxed">
                        Complete our premium verification process to get your hostel listed and verified by Roomzy.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1.5 bg-[#0B1A30] transition-all duration-700" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                currentStep >= step.id ? 'bg-[#0B1A30] text-white shadow-2xl scale-110' : 'bg-gray-100 text-gray-400'
                            }`}>
                                <step.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentStep >= step.id ? 'text-[#0B1A30]' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Name</label>
                                        <div className="relative">
                                            <FiHome className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text" placeholder="e.g. Royal Executive Hostel"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#0B1A30] focus:ring-4 focus:ring-primary-500/5 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender Policy</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['boys_only', 'girls_only', 'co_ed'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFormData({...formData, genderType: type})}
                                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        formData.genderType === type ? 'bg-[#0B1A30] text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {type.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Property (Min 100 characters)</label>
                                    <textarea
                                        rows={6} placeholder="Highlight your rooms, security, and environment..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-[#0B1A30] focus:ring-4 focus:ring-primary-500/5 outline-none transition-all resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <span className={`text-[10px] font-black uppercase ${formData.description.length >= 100 ? 'text-emerald-500' : 'text-red-400'}`}>
                                            {formData.description.length} / 100 characters
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                        <input
                                            type="text" placeholder="Abbottabad"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area</label>
                                        <input
                                            type="text" placeholder="Mandian"
                                            value={formData.area}
                                            onChange={(e) => setFormData({...formData, area: e.target.value})}
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                                    <textarea
                                        rows={3} value={formData.fullAddress}
                                        onChange={(e) => setFormData({...formData, fullAddress: e.target.value})}
                                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold"
                                    />
                                </div>
                                <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest ml-1">Latitude</label>
                                        <input type="text" placeholder="34.1985" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} className="w-full bg-white px-4 py-4 rounded-xl text-xs font-bold border border-amber-200 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest ml-1">Longitude</label>
                                        <input type="text" placeholder="73.2315" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} className="w-full bg-white px-4 py-4 rounded-xl text-xs font-bold border border-amber-200 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest ml-1">Nearest Institute</label>
                                        <select 
                                            value={formData.nearestInstituteId} 
                                            onChange={(e) => setFormData({...formData, nearestInstituteId: e.target.value})}
                                            className="w-full bg-white px-4 py-4 rounded-xl text-xs font-bold border border-amber-200 outline-none"
                                        >
                                            <option value="">{formData.area ? `Searching in ${formData.area}...` : 'Select University...'}</option>
                                            {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-12 space-y-10">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter">Amenity Checklist</h3>
                                    <p className="text-xs text-gray-400 font-bold tracking-tight">Select all facilities available at your hostel.</p>
                                </div>
                                
                                {fetchingData ? (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-[#0B1A30] border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synchronizing Facilities...</p>
                                    </div>
                                ) : error === 'amenities' ? (
                                    <div className="py-20 text-center space-y-6">
                                        <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Failed to load facilities</p>
                                        <button 
                                            onClick={fetchInitialData}
                                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#0B1A30] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                        >
                                            <FiRefreshCw /> Retry Loading
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                        {amenitiesMaster.map(amenity => (
                                            <button
                                                key={amenity.id}
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`p-7 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 ${
                                                    formData.amenityIds.includes(amenity.id)
                                                        ? 'border-[#0B1A30] bg-[#0B1A30] text-white shadow-2xl scale-[1.02]'
                                                        : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:border-gray-200'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    formData.amenityIds.includes(amenity.id) ? 'bg-white/10' : 'bg-white shadow-sm'
                                                }`}>
                                                    <FiCheck className={formData.amenityIds.includes(amenity.id) ? 'text-white' : 'text-gray-200'} />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-wider">{amenity.name}</span>
                                            </button>
                                        ))}
                                        {amenitiesMaster.length === 0 && !fetchingData && (
                                            <div className="col-span-full py-20 text-center">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No facilities found. Contact support.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-12 space-y-10">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High-Resolution Gallery</h4>
                                            <p className="text-sm text-[#0B1A30] font-black tracking-tight">Upload minimum 4 photos</p>
                                        </div>
                                        <label className="flex items-center gap-3 px-8 py-4 bg-[#0B1A30] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-800 transition-all shadow-2xl shadow-[#0B1A30]/20">
                                            <FiUploadCloud size={20} /> Add Photos
                                            <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative group shadow-lg border-4 border-white">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <button onClick={() => removeImage(i)} className="p-4 bg-red-500 text-white rounded-2xl"><FiTrash2 size={22} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 5 && (
                            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-12 space-y-12">
                                <div className="max-w-md mx-auto p-12 bg-[#0B1A30] rounded-[3.5rem] text-center space-y-8 shadow-3xl shadow-[#0B1A30]/20">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Monthly Starting Rent</label>
                                    <div className="relative">
                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-white/20">Rs.</span>
                                        <input
                                            type="number"
                                            value={formData.startingPrice}
                                            onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                                            className="w-full pl-24 pr-8 py-8 bg-white/5 border-2 border-white/10 rounded-[2.5rem] text-4xl font-black text-white outline-none focus:border-white/30 transition-all text-center"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white p-6 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 flex justify-between items-center px-10">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="border-gray-100 px-12 py-7 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"><FiArrowLeft size={18} /> Previous</Button>
                    {currentStep < STEPS.length ? (
                        <Button onClick={nextStep} className="bg-[#0B1A30] text-white px-16 py-7 text-[10px] font-black uppercase tracking-widest flex items-center gap-4">Next Step <FiArrowRight size={18} /></Button>
                    ) : (
                        <Button onClick={handleSubmit} loading={loading} className="bg-emerald-600 text-white px-20 py-7 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-3xl shadow-emerald-500/30">Submit for Review <FiCheck size={18} /></Button>
                    )}
                </div>
            </div>
            )}
        </DashboardLayout>
    );
}
