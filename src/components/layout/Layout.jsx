import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'text-sm font-medium',
                    style: { borderRadius: '12px', padding: '12px 16px' },
                }}
            />
            <Navbar />
            <main className="flex-1 pb-16 lg:pb-0">
                <Outlet />
            </main>
            <div className="hidden lg:block">
                <Footer />
            </div>
            {/* On mobile, we might want to hide footer or keep it below bottom nav */}
            <div className="lg:hidden">
                <Footer />
                <div className="h-16" /> {/* Spacer for bottom nav */}
            </div>
            <MobileBottomNav />
        </div>
    );
}
