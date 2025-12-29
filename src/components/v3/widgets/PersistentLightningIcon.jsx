
import React from 'react';
import { Zap } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

export default function PersistentLightningIcon() {
    const { isAnyWidgetActive, setIsWidgetMenuOpen, isWidgetMenuOpen } = useStackNavigation();

    const handleClick = () => {
        setIsWidgetMenuOpen(!isWidgetMenuOpen);
    };

    return (
        <motion.button
            layout
            onClick={handleClick}
            className={cn(
                "fixed top-[12px] right-4 z-[9999] w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                isAnyWidgetActive
                    ? "bg-white shadow-[0_0_20px_rgba(20,184,166,0.5)] border border-teal-100"
                    : "bg-white/80 backdrop-blur-sm border border-stone-200 hover:bg-white text-stone-400 hover:text-stone-600"
            )}
            initial={false}
            animate={{
                scale: isAnyWidgetActive ? 1.05 : 1,
            }}
            whileTap={{ scale: 0.9 }}
        >
            <div className="relative flex items-center justify-center w-full h-full">
                {/* Pulsing/Glow Effect Layer */}
                {isAnyWidgetActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-teal-400 opacity-20"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0, 0.2]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}

                {/* Icon Layer */}
                <Zap
                    className={cn(
                        "w-5 h-5 transition-colors duration-300 relative z-10",
                        isAnyWidgetActive ? "text-teal-500 fill-teal-500" : "fill-current"
                    )}
                />
            </div>
        </motion.button>
    );
}
