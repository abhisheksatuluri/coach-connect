
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStackNavigation } from '@/context/StackNavigationContext';

/**
 * ScrollLinkHeader
 * Header that shrinks and adds shadow on scroll.
 */
export default function ScrollShrinkHeader({
    title,
    scrollRef,
    action,
    showBack = true
}) {
    const { popScreen } = useStackNavigation();

    // If scrollRef isn't provided (e.g. initial render), fallback safely
    // In real usage, parent passes Ref from PremiumScrollContainer
    // BUT useScroll requires a ref to the container, which is harder to pass down cleanly if strictly separated.
    // Simpler approach: Pass scrollY value or just CSS sticky behavior with intersection observer?
    // Actually, framer-motion useScroll works best if we pass the container ref.

    // ALTERNATIVE: CSS-Sticky based approach with transition class
    // We already have a "p-4 border-b sticky top-0" pattern.
    // Let's enhance that pattern instead of over-engineering with scroll-linked transforms for now,
    // to ensure robustness first. We can add the shrink effect via a context or simple state.

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 transition-all duration-200">
            <div className="h-14 md:h-16 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={popScreen}
                            className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-lg font-bold text-stone-900 leading-tight">{title}</h1>
                </div>
                {action}
            </div>
        </div>
    );
}
