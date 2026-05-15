import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="text-8xl font-bold gradient-text mb-4">404</div>
                <h1 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h1>
                <p className="text-text-muted mb-8">
                    Oops! The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                    <Link to="/listings">
                        <Button variant="secondary">Browse Listings</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
