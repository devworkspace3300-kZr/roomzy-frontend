import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
    primary: 'gradient-primary text-white shadow-md hover:shadow-lg',
    secondary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
    ghost: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
    white: 'bg-white text-text-primary shadow-md hover:shadow-lg',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;
