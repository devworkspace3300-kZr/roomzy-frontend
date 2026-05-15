import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiStar, FiUser, FiChevronLeft, FiChevronRight, FiX, FiHeart, FiShare2, FiCheck, FiDollarSign } from 'react-icons/fi';
import { LuBed } from 'react-icons/lu';
import { HiCheckBadge } from 'react-icons/hi2';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROOM_TYPE_LABELS = {
    single: 'Single', double: 'Double', triple: 'Triple',
    quad: 'Quad', dormitory: 'Dormitory',
};

export default function HostelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isStudent } = useAuth();
    const [hostel, setHostel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [moveInDate, setMoveInDate] = useState('');
    const [duration, setDuration] = useState(3);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/hostels/${id}`)
            .then(res => {
                const data = res.data?.data;
                setHostel(data);
                setRooms(data?.rooms || []);
            })
            .catch(() => setHostel(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBook = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!isStudent) { toast.error('Only students can make bookings'); return; }
        if (!selectedRoom) { toast.error('Please select a room first'); return; }
        if (!moveInDate) { toast.error('Please select a move-in date'); return; }
        setBooking(true);
        try {
            await api.post('/bookings', {
                hostelId: hostel.id,
                roomId: selectedRoom.id,
                moveInDate,
                durationMonths: duration,
            });
            toast.success('Booking request sent! The owner will respond shortly.');
            navigate('/dashboard/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    // Build images array
    const images = hostel?.images?.length > 0
        ? hostel.images.map(img => typeof img === 'string' ? img : img.imageUrl)
        : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];

    if (loading) return (
        <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[400px] animate-shimmer rounded-2xl mt-8" />
            <div className="grid lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-8 w-3/4 animate-shimmer rounded-lg" />
                    <div className="h-4 w-1/2 animate-shimmer rounded-lg" />
                    <div className="h-32 animate-shimmer rounded-xl" />
                </div>
                <div className="h-64 animate-shimmer rounded-2xl" />
            </div>
        </div>
    );

    if (!hostel) return (
        <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Hostel Not Found</h2>
                <p className="text-text-muted mb-6">The hostel you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
                <Link to="/listings"><Button>Browse Listings</Button></Link>
            </div>
        </div>
    );

    return (
        <div className="pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="py-4 flex items-center gap-2 text-sm text-text-muted">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/listings" className="hover:text-primary-600 transition-colors">Listings</Link>
                    <span>/</span>
                    <span className="text-text-primary font-medium">{hostel.name}</span>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                    <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => { setActiveImage(0); setLightboxOpen(true); }}>
                        <img src={images[0]} alt={hostel.name} className="w-full h-full min-h-[300px] object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src='https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }}/>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    {images.slice(1, 5).map((img, i) => (
                        <div key={i} className="hidden md:block relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => { setActiveImage(i + 1); setLightboxOpen(true); }}>
                            <img src={img} alt="" className="w-full h-full min-h-[140px] object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.src='https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'; }}/>
                            {i === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-semibold">+{images.length - 5} more</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between mt-4 mb-8">
                    <div className="flex items-center gap-2">
                        {hostel.status === 'verified' && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent-50 text-accent-600 text-sm font-semibold">
                                <HiCheckBadge size={16} /> Verified
                            </span>
                        )}
                        {hostel.genderType === 'girls_only' && (
                            <span className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-sm font-semibold">Girls Only</span>
                        )}
                        {hostel.genderType === 'boys_only' && (
                            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">Boys Only</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSaved(!isSaved)} className={`p-2.5 rounded-xl border transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'border-border hover:border-primary-300 text-text-muted hover:text-primary-500'}`}>
                            <FiHeart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-2.5 rounded-xl border border-border hover:border-primary-300 text-text-muted hover:text-primary-500 transition-all">
                            <FiShare2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{hostel.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-muted">
                                <div className="flex items-center gap-1.5">
                                    <FiMapPin size={15} />
                                    <span>{hostel.fullAddress || `${hostel.area}, ${hostel.city}`}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-3">About This Hostel</h2>
                            <p className="text-text-secondary leading-relaxed">{hostel.description}</p>
                        </div>

                        {/* Amenities Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Amenities & Facilities</h2>
                            {hostel.amenities && hostel.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {hostel.amenities.map((amenity) => (
                                        <div key={amenity.id || amenity.slug} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-border-light group hover:border-primary-200 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <FiCheck size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-text-secondary">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-gray-50 border border-border-light text-center text-text-muted">
                                    <FiCheck size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No specific amenities listed for this hostel.</p>
                                </div>
                            )}
                        </div>

                        {/* Available Rooms */}
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-4">
                                Available Rooms ({rooms.length} Types • {rooms.reduce((acc, r) => acc + r.availableBeds, 0)} Beds)
                            </h2>
                            {rooms.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-gray-50 border border-border-light text-center text-text-muted">
                                    <LuBed size={28} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No rooms available at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rooms.map(room => (
                                        <div
                                            key={room.id}
                                            onClick={() => {
                                                if (room.availableBeds <= 0) {
                                                    toast.error('This room is currently full');
                                                    return;
                                                }
                                                setSelectedRoom(selectedRoom?.id === room.id ? null : room);
                                            }}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedRoom?.id === room.id ? 'border-primary-500 bg-primary-50' : 'border-border-light hover:border-primary-200 bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-text-primary">{ROOM_TYPE_LABELS[room.roomType] || room.roomType} Room</span>
                                                        {room.roomNumber && <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded">#{room.roomNumber}</span>}
                                                        {room.floor && <span className="text-xs text-text-muted">Floor {room.floor}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-text-muted">
                                                        <span><LuBed size={13} className="inline mr-1" />{room.availableBeds}/{room.totalBeds} beds available</span>
                                                    </div>
                                                    {room.description && <p className="text-xs text-text-muted mt-1">{room.description}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-text-primary">₨{room.pricePerMonth?.toLocaleString()}</div>
                                                    <div className="text-xs text-text-muted">/month</div>
                                                    {selectedRoom?.id === room.id && (
                                                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary-600 font-semibold">
                                                            <FiCheck size={12} /> Selected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location / Map */}
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Location</h2>
                            <div className="rounded-3xl overflow-hidden border border-border-light shadow-sm">
                                {hostel.latitude && hostel.longitude ? (
                                    <iframe 
                                        width="100%" 
                                        height="350" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight="0" 
                                        marginWidth="0" 
                                        src={`https://maps.google.com/maps?q=${hostel.latitude},${hostel.longitude}&z=15&output=embed`}
                                        className="grayscale-[0.2] contrast-[1.1] brightness-[1.05]"
                                    />
                                ) : (
                                    <div className="h-64 bg-gray-50 flex flex-col items-center justify-center text-text-muted gap-3">
                                        <FiMapPin size={32} className="opacity-20" />
                                        <p className="text-sm font-medium">Map coordinates not available</p>
                                    </div>
                                )}
                                <div className="p-6 bg-white flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                        <FiMapPin size={22} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary">{hostel.area}, {hostel.city}</p>
                                        <p className="text-sm text-text-muted leading-relaxed mt-1">{hostel.fullAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="sticky top-24 bg-white rounded-2xl border border-border-light shadow-card p-6 space-y-5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-text-primary">
                                    {hostel.startingPrice ? `₨${hostel.startingPrice.toLocaleString()}` : (rooms[0] ? `₨${rooms[0].pricePerMonth?.toLocaleString()}` : 'Contact')}
                                </span>
                                <span className="text-text-muted text-sm">/month</span>
                            </div>

                            {selectedRoom && (
                                <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 text-sm">
                                    <p className="font-semibold text-primary-700">{ROOM_TYPE_LABELS[selectedRoom.roomType]} Room selected</p>
                                    <p className="text-primary-600">₨{selectedRoom.pricePerMonth?.toLocaleString()}/month</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Move-in Date</label>
                                    <input
                                        type="date"
                                        value={moveInDate}
                                        onChange={e => setMoveInDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full mt-1 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                                    >
                                        <option value={1}>1 Month</option>
                                        <option value={3}>3 Months</option>
                                        <option value={6}>6 Months</option>
                                        <option value={12}>12 Months</option>
                                    </select>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleBook}
                                loading={booking}
                                disabled={rooms.length === 0}
                            >
                                {rooms.length === 0 ? 'No Rooms Available' : 'Book Now'}
                            </Button>
                            {!isAuthenticated && (
                                <p className="text-xs text-center text-text-muted">
                                    <Link to="/login" className="text-primary-600 font-semibold">Log in</Link> to make a booking
                                </p>
                            )}

                            {/* Owner Info */}
                            {hostel.owner && (
                                <div className="pt-4 border-t border-border-light">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                                            {hostel.owner.profileImageUrl
                                                ? <img src={hostel.owner.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                                : <FiUser size={20} className="text-primary-500" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{hostel.owner.fullName}</p>
                                            <p className="text-xs text-text-muted">Property Owner</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2" onClick={() => setLightboxOpen(false)}>
                            <FiX size={28} />
                        </button>
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p - 1 + images.length) % images.length); }}>
                            <FiChevronLeft size={32} />
                        </button>
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={images[activeImage]}
                            alt=""
                            className="max-w-full max-h-[80vh] rounded-xl object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p + 1) % images.length); }}>
                            <FiChevronRight size={32} />
                        </button>
                        <div className="absolute bottom-6 flex gap-2">
                            {images.map((_, i) => (
                                <button key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-white w-6' : 'bg-white/40'}`} onClick={(e) => { e.stopPropagation(); setActiveImage(i); }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Mobile Sticky Booking Bar */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-border-light p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <div className="text-lg font-bold text-text-primary">
                            ₨{selectedRoom ? selectedRoom.pricePerMonth?.toLocaleString() : (hostel.startingPrice?.toLocaleString() || '---')}
                        </div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Per Month</div>
                    </div>
                    <Button 
                        className="flex-1 rounded-xl py-3.5 font-bold uppercase text-[11px] tracking-widest shadow-lg shadow-primary-500/20"
                        onClick={handleBook}
                        loading={booking}
                    >
                        {selectedRoom ? 'Book Now' : 'Select Room'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
