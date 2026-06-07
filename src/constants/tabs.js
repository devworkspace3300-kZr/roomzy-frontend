import { FiGrid, FiCompass, FiCalendar, FiBriefcase, FiMessageSquare, FiBookmark, FiHome, FiInbox, FiUsers, FiDollarSign, FiPieChart, FiSettings, FiShield } from 'react-icons/fi';

export const STUDENT_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'browse', label: 'Browse', icon: FiCompass },
    { id: 'bookings', label: 'My Bookings', icon: FiCalendar },
    { id: 'active_stay', label: 'Active Stay', icon: FiBriefcase },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'settings', label: 'Settings', icon: FiSettings },
];

export const OWNER_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'hostels', label: 'My Hostels', icon: FiHome },
    { id: 'requests', label: 'Booking Requests', icon: FiInbox },
    { id: 'stays', label: 'Active Stays', icon: FiUsers },
    { id: 'settings', label: 'Settings', icon: FiSettings },
];

export const ADMIN_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'all_hostels', label: 'All Hostels', icon: FiHome },
    { id: 'hostels', label: 'Hostel Verifications', icon: FiInbox },
    { id: 'verifications', label: 'Owner Verifications', icon: FiShield },
    { id: 'bookings', label: 'All Bookings', icon: FiCalendar },
    { id: 'reviews', label: 'Student Reviews', icon: FiBookmark },
    { id: 'settings', label: 'Account Settings', icon: FiSettings },
];

export const getTabsByRole = (role) => {
    switch (role) {
        case 'student': return STUDENT_TABS;
        case 'owner': return OWNER_TABS;
        case 'admin': return ADMIN_TABS;
        default: return [];
    }
};
