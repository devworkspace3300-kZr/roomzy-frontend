import os

file_path = r"c:\roomzy\frontend\src\pages\dashboard\StudentDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """            {activeTab === 'active_stay' && (
                <div className="animate-fade-in space-y-8 pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Active Tenancy</h2>
                        <p className="text-gray-500 mt-1 font-medium">Full details of your current residence at Roomzy</p>
                    </div>

                    {activeStay ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-1 shadow-sm border border-gray-100 overflow-hidden relative group">
                                    <div className="aspect-[21/9] w-full overflow-hidden">
                                        <img 
                                            src={activeStay.hostel?.images?.[0]?.imageUrl || activeStay.hostel?.images?.[0]?.url || activeStay.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200'} 
                                            alt="Hostel" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/20 to-transparent" />
                                    </div>
                                    <div className="p-8 relative -mt-32">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                                {activeStay.status === 'active_stay' ? 'Currently Staying' : 'Move-in Confirmed'}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verified Property ✓</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{activeStay.hostel?.name}</h3>
                                        <p className="text-gray-300 font-medium flex items-center gap-2 mb-8">
                                            <FiMapPin className="text-primary-400" size={16}/> {activeStay.hostel?.fullAddress || `${activeStay.hostel?.area}, ${activeStay.hostel?.city}`}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Room Details</p>
                                                <p className="text-lg font-black text-white">Room {activeStay.room?.roomNumber || '—'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{activeStay.room?.roomType} Selection</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Move-in Date</p>
                                                <p className="text-lg font-black text-white">{formatDate(activeStay.moveInDate, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Requested Date</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 col-span-2 sm:col-span-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                                                <p className="text-lg font-black text-white">PKR {activeStay.monthlyPrice?.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Incl. Maintenance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Hostel Features</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['High-Speed Wi-Fi', '24/7 Security', 'Meal Service', 'Power Backup'].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                <span className="text-[10px] font-bold text-[#0B1A30] uppercase tracking-widest">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {['confirmed', 'active_stay'].includes(activeStay.status) ? (
                                        <Button className="w-full mt-8 bg-[#0B1A30] hover:bg-gray-800 py-4 shadow-xl shadow-[#0B1A30]/10">
                                            Contact Warden
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full mt-8 bg-gray-200 text-gray-500 py-4 cursor-not-allowed border-none">
                                            Payment Required to Contact Warden
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <FiHome size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Active Residency</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto">Once your booking is approved and you move in, your tenancy details will appear here.</p>
                            <Link to="/listings" className="inline-block mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-600 pb-1">Browse Hostels →</Link>
                        </div>
                    )}
                </div>
            )}"""

replacement = """            {activeTab === 'active_stay' && (
                <div className="animate-fade-in space-y-8 pb-8">
                    <div>
                        <h2 className="text-3xl font-[900] text-[#0B1A30] tracking-tight">Active Tenancy</h2>
                        <p className="text-gray-500 mt-1 font-medium">Full details of your current residence and booking status at Roomzy</p>
                    </div>

                    {activeStay ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* Tenancy Main Card */}
                                <div className="bg-white rounded-[2.5rem] p-1 shadow-sm border border-gray-100 overflow-hidden relative group">
                                    <div className="aspect-[21/9] w-full overflow-hidden">
                                        <img 
                                            src={activeStay.hostel?.images?.[0]?.imageUrl || activeStay.hostel?.images?.[0]?.url || activeStay.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200'} 
                                            alt="Hostel" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A30] via-[#0B1A30]/35 to-transparent" />
                                    </div>
                                    <div className="p-8 relative -mt-32">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border text-white ${
                                                activeStay.status === 'active_stay' 
                                                    ? 'bg-emerald-500/30 border-emerald-400/40' 
                                                    : activeStay.status === 'confirmed' 
                                                        ? 'bg-blue-500/30 border-blue-400/40'
                                                        : 'bg-amber-500/30 border-amber-400/40'
                                            }`}>
                                                {activeStay.status === 'active_stay' 
                                                    ? 'Currently Staying' 
                                                    : activeStay.status === 'confirmed' 
                                                        ? 'Awaiting Move-in' 
                                                        : 'Booking Approved'}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Verified Property ✓</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{activeStay.hostel?.name}</h3>
                                        <p className="text-gray-300 font-medium flex items-center gap-2 mb-8">
                                            <FiMapPin className="text-primary-400" size={16}/> {activeStay.hostel?.fullAddress || `${activeStay.hostel?.area}, ${activeStay.hostel?.city}`}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Room Details</p>
                                                <p className="text-lg font-black text-white">Room {activeStay.room?.roomNumber || '—'}</p>
                                                <p className="text-[10px] text-gray-300 font-bold uppercase">{activeStay.room?.roomType} Selection</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Move-in Date</p>
                                                <p className="text-lg font-black text-white">{formatDate(activeStay.moveInDate, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-300 font-bold uppercase">Requested Check-in</p>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 col-span-2 sm:col-span-1">
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Monthly Rent</p>
                                                <p className="text-lg font-black text-white">PKR {activeStay.monthlyPrice?.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-300 font-bold uppercase">Incl. Maintenance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tenancy Timeline Block */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tenancy Status Timeline</h4>
                                    <div className="relative border-l border-gray-100 pl-6 ml-3 space-y-6">
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-100">✓</div>
                                            <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">Booking Created & Submitted</p>
                                            <p className="text-xs text-gray-400 mt-1">Your request was submitted and assigned reference ID: <span className="font-bold text-[#0B1A30]">{activeStay.id}</span></p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-100">✓</div>
                                            <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">Approved by Property Owner</p>
                                            <p className="text-xs text-gray-400 mt-1">The hostel owner approved your tenancy request and allocated bed slots.</p>
                                        </div>
                                        <div className="relative">
                                            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                                                ['confirmed', 'active_stay'].includes(activeStay.status) 
                                                    ? 'bg-emerald-500 ring-emerald-100' 
                                                    : 'bg-amber-500 ring-amber-100 animate-pulse'
                                            }`}>
                                                {['confirmed', 'active_stay'].includes(activeStay.status) ? '✓' : '⌛'}
                                            </div>
                                            <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">Rent Payment Verified</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {['confirmed', 'active_stay'].includes(activeStay.status) 
                                                    ? 'Payment verified successfully by owner.' 
                                                    : 'Awaiting your physical rent payment to owner.'}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                                                activeStay.status === 'active_stay' 
                                                    ? 'bg-emerald-500 ring-emerald-100' 
                                                    : 'bg-gray-200 ring-gray-100'
                                            }`}>
                                                {activeStay.status === 'active_stay' ? '✓' : '⌛'}
                                            </div>
                                            <p className="text-[10px] font-black text-[#0B1A30] uppercase tracking-widest">Move-in Confirmation</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {activeStay.status === 'active_stay' 
                                                    ? 'Residency active! Welcome to your new room.' 
                                                    : 'Awaiting your arrival at the hostel. The owner will confirm your check-in.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Tenancy & Contract details */}
                                <div className="bg-[#0B1A30] rounded-[2rem] p-8 shadow-xl text-white">
                                    <h4 className="text-[10px] font-black text-[#8BA3C7] uppercase tracking-[0.2em] mb-6">Contract & Tenure</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</span>
                                            <span className="text-xs font-black">{formatDate(activeStay.moveInDate, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expected End</span>
                                            <span className="text-xs font-black">{formatDate(activeStay.expectedEndDate, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contract Length</span>
                                            <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full text-primary-300">{activeStay.durationMonths || '—'} Months</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reference Code</span>
                                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-emerald-400 font-bold uppercase">{activeStay.id?.substring(0, 8)}...</span>
                                        </div>
                                    </div>

                                    {activeStay.status === 'confirmed' && (
                                        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Warden Instruction</p>
                                            <p className="text-[11px] text-gray-300 leading-relaxed font-medium">Your payment is verified! Show your Booking reference code to the warden upon arrival to complete your check-in.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Features & Warden Contact */}
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Hostel Features</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['High-Speed Wi-Fi', '24/7 Security', 'Meal Service', 'Power Backup'].map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                <span className="text-[10px] font-bold text-[#0B1A30] uppercase tracking-widest">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {['confirmed', 'active_stay'].includes(activeStay.status) ? (
                                        <Button className="w-full mt-8 bg-[#0B1A30] hover:bg-gray-800 py-4 shadow-xl shadow-[#0B1A30]/10">
                                            Contact Warden
                                        </Button>
                                    ) : (
                                        <Button disabled className="w-full mt-8 bg-gray-200 text-gray-500 py-4 cursor-not-allowed border-none">
                                            Payment Required to Contact Warden
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <FiHome size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#0B1A30] uppercase tracking-tighter mb-2">No Active Residency</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto">Once your booking is approved and you move in, your tenancy details will appear here.</p>
                            <Link to="/listings" className="inline-block mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-600 pb-1">Browse Hostels →</Link>
                        </div>
                    )}
                </div>
            )}"""

# Replace both LF and CRLF variations
if target in content:
    content = content.replace(target, replacement)
    print("Replaced successfully with LF")
else:
    target_crlf = target.replace("\n", "\r\n")
    replacement_crlf = replacement.replace("\n", "\r\n")
    if target_crlf in content:
        content = content.replace(target_crlf, replacement_crlf)
        print("Replaced successfully with CRLF")
    else:
        print("Target content not found!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
