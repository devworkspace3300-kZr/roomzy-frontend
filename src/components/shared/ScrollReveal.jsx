import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';

export default function ScrollReveal({ children, className = '', direction = 'up', delay = 0 }) {
    const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

    const directionVariants = {
        up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
        down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
        left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
        right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
        scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={directionVariants[direction] || directionVariants.up}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
