import { useEffect, useState, useRef } from 'react';

export default function Counter({ value, duration = 1800 }) {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    // Extract numeric value from string (e.g. "1,200+" -> 1200)
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    const hasPlus = value.includes('+');
    const hasComma = value.includes(',');

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let startTimestamp = null;

                    const step = (timestamp) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        
                        // Smooth ease-out quad animation curve
                        const easeProgress = progress * (2 - progress);
                        const currentVal = Math.floor(easeProgress * numericValue);
                        
                        setCount(currentVal);

                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            setCount(numericValue);
                        }
                    };

                    window.requestAnimationFrame(step);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [numericValue, duration, hasAnimated]);

    const formatNumber = (num) => {
        if (hasComma) {
            return num.toLocaleString();
        }
        return num.toString();
    };

    return (
        <span ref={elementRef}>
            {formatNumber(count)}
            {hasPlus && '+'}
        </span>
    );
}
