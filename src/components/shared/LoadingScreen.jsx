import { motion } from 'framer-motion';
import logo from '../../assets/logo.jpg';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
            >
                <div className="mb-4">
                    <img src={logo} alt="Roomzy Logo" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                </div>
                <h2 className="text-2xl font-[800] text-text-primary tracking-tight mb-2">Roomzy</h2>
                <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary-500"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
