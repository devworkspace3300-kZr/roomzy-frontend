export const APP_CONFIG = {
    name: 'Roomzy',
    tagline: 'Find Your Room. Own Your Journey.',
    description: "Pakistan's trusted platform connecting students with safe, affordable, and verified accommodation across KPK and beyond.",
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    version: '1.0.0',
    supportEmail: 'support@roomzy.pk',
    supportPhone: '+92-332-8912706',
    social: {
        facebook: 'https://facebook.com/roomzy',
        instagram: 'https://instagram.com/roomzy',
        twitter: 'https://twitter.com/roomzy',
        linkedin: 'https://linkedin.com/company/roomzy',
    },
    officeAddress: 'Main Mansehra Road, Near Comsats University, Abbottabad, KPK, Pakistan',
};

export const ROUTES = {
    HOME: '/',
    LISTINGS: '/listings',
    HOSTEL_DETAILS: '/hostel/:id',
    ABOUT: '/about',
    CONTACT: '/contact',
    FAQ: '/faq',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    OTP_VERIFICATION: '/otp-verification',
    STUDENT_DASHBOARD: '/dashboard/student',
    OWNER_DASHBOARD: '/dashboard/owner',
    ADMIN_DASHBOARD: '/dashboard/admin',
};

export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};
