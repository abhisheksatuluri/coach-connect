
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Premium Scroll Container
 * Provides:
 * - Native momentum scrolling
 * - Scroll progress tracking
 * - Overscroll behavior containment
 * - Hardware acceleration optimization
 */
export default function PremiumScrollContainer({
    children,
    className,
    onScroll,
    enableParallax = false
}) {
    const containerRef = useRef(null);
    const { scrollY } = useScroll({ container: containerRef });

    // Spring physics for smooth values if needed (for parallax etc)
    const smoothScrollY = useSpring(scrollY, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            if (onScroll && containerRef.current) {
                onScroll(containerRef.current.scrollTop);
            }
        };

        const currentRef = containerRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [onScroll]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex-1 w-full h-full overflow-y-auto overflow-x-hidden relative bg-[#FAFAF9]",
                "scroll-smooth overscroll-y-contain", // Native behaviors
                "scrollbar-none md:scrollbar-thin md:scrollbar-thumb-stone-200 md:scrollbar-track-transparent", // Custom scrollbar
                className
            )}
            style={{
                WebkitOverflowScrolling: 'touch', // iOS Momentum
                transform: 'translateZ(0)', // Force GPU layer
            }}
        >
            <div className="absolute inset-x-0 min-h-full">
                {children}
            </div>
        </div>
    );
}
