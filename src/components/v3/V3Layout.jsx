
import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import V3Header from './V3Header';
import V3BottomNav from './V3BottomNav';
import V3Sidebar from './V3Sidebar';
import V3MoreMenu from './V3MoreMenu';
import V3WidgetMenu from './widgets/V3WidgetMenu';
import { StackNavigationProvider, useStackNavigation } from '@/context/StackNavigationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PersistentLightningIcon from './widgets/PersistentLightningIcon';

// --- PREMIUM ANIMATION CONSTANTS ---
const SPRING_MAIN = { type: "spring", stiffness: 280, damping: 26, mass: 1 }; // Responsive but smooth
const SPRING_SETTLE = { type: "spring", stiffness: 400, damping: 30, mass: 1 }; // Quicker settle
const DRAG_THRESHOLDS = {
    cancel: 150, // px to drag before dismiss
    velocity: 500 // velocity to dismiss
};

// --- ANIMATION PHASES & VARIANTS ---

// The "Background" cards (stack depth)
const backgroundVariants = {
    active: {
        scale: 1,
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        borderRadius: "0px",
        transition: { ...SPRING_MAIN }
    },
    inactive: (index) => ({
        scale: 0.94 - (index * 0.04), // 0.94, 0.90, etc.
        x: -30 + (index * -10), // -30px, -40px
        opacity: 0.6 - (index * 0.1), // Dimmer as it goes back
        filter: "blur(6px)", // Blur for depth
        borderRadius: "16px",
        transition: {
            ...SPRING_MAIN,
            delay: 0.02 // Tiny delay to let foreground start moving first (Anticipation phase overlap)
        }
    })
};

// The "Foreground" entering/exiting screen
const screenVariants = {
    initial: {
        x: "100%",
        scale: 1.02, // Start slightly larger (Anticipation/Enter)
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    },
    animate: {
        x: 0,
        scale: 1,
        boxShadow: "-5px 10px 40px rgba(0,0,0,0.18)", // Final shadow
        transition: {
            x: { ...SPRING_MAIN, delay: 0.08 }, // 80ms Anticipation delay before sliding in
            scale: { ...SPRING_SETTLE, delay: 0.28 }, // Settle scale slightly later
            boxShadow: { duration: 0.4 }
        }
    },
    exit: {
        x: "100%",
        scale: 1.01, // Lift off slightly on exit
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        transition: { ...SPRING_MAIN }
    }
};

// Content Stagger (Fade in after screen lands)
const contentStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.35, // 350ms - wait for screen to land
            duration: 0.1
        }
    }
};


function V3LayoutContent({ children, title, showBack = false, initialActiveTab = 'dashboard', showHeader = true }) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const { stack, popScreen, clearStack, isWidgetMenuOpen, setIsWidgetMenuOpen } = useStackNavigation();
    const navigate = useNavigate();

    // Calculate depth for root view
    const isRootActive = stack.length === 0;

    const handleNav = (id) => {
        if (id === 'more') {
            setIsMoreOpen(true);
            return;
        }

        // If clicking the already active tab, clear the stack (pop to root)
        if (id === activeTab) {
            if (!isRootActive && clearStack) {
                clearStack();
            }
            return;
        }

        if (id === 'dashboard') {
            setActiveTab('dashboard');
            // navigate('/v3/dashboard'); 
        } else {
            setActiveTab(id);
            if (['contacts', 'sessions', 'journeys', 'tasks', 'payments', 'notebook'].includes(id)) {
                navigate(`/v3/${id}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black overflow-hidden relative selection:bg-teal-100 selection:text-teal-900">
            {/* --- PERSISTENT LIGHTNING ICON --- */}
            <PersistentLightningIcon />

            {/* --- ROOT VIEW CONTAINER (Layer 0) --- */}
            {/* This is the "Base" page that gets pushed back when stack items appear */}
            <motion.div
                className="h-screen w-full bg-[#FAFAF9] text-[#1C1917] flex flex-col relative will-change-transform origin-center"
                variants={backgroundVariants}
                animate={isRootActive ? "active" : "inactive"}
                custom={0} // Index 0 for background calculation
                style={{ height: '100vh', touchAction: 'none' }} // Prevent browser swipe nav
            >
                {/* Top Header - Global */}
                <div className={cn("md:pl-[240px] transition-all duration-200")}>
                    {showHeader && (
                        <V3Header
                            title={title}
                            showBack={showBack}
                            isWidgetActive={false} // Handled by persistent icon
                        />
                    )}
                </div>

                {/* Desktop Sidebar */}
                <V3Sidebar activeTab={activeTab} onTabChange={handleNav} />

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 overflow-hidden md:pl-[240px] flex flex-col",
                    showHeader ? "pt-16" : "pt-0",
                    "pb-0 md:pb-8" // Remove default mobile bottom padding as lists handle it
                )}>
                    <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-stretch h-full">
                        {children}
                    </div>
                </main>

                {/* Overlay for clicking back to focus */}
                {!isRootActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/5 z-40 cursor-pointer"
                    // Optional: Tap backdrop to pop
                    // onClick={() => popScreen()} 
                    />
                )}
            </motion.div>

            {/* --- STACKED SCREENS (Layer 1+) --- */}
            <AnimatePresence mode='popLayout'>
                {stack.map((screen, index) => {
                    const ScreenComponent = screen.component;
                    const isTop = index === stack.length - 1;
                    const depthIndex = stack.length - 1 - index; // 0 for top, 1 for behind, etc.

                    return (
                        <motion.div
                            key={screen.id}
                            className="absolute inset-0 bg-white overflow-hidden will-change-transform shadow-2xl"

                            // Stack Logic
                            style={{ zIndex: 50 + index }}

                            // If it's NOT the top screen, it behaves like a background card
                            variants={isTop ? screenVariants : backgroundVariants}
                            initial={isTop ? "initial" : false} // Only animate enter if it's the new top
                            animate={isTop ? "animate" : "inactive"} // Top = animate in; Behind = inactive state
                            exit="exit"
                            custom={depthIndex} // Pass depth for background calc

                            // Drag to Dismiss (Swipe Back)
                            drag={isTop ? "x" : false} // Only top card is draggable
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={{ left: 0.1, right: 0.7 }}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (offset.x > DRAG_THRESHOLDS.cancel || velocity.x > DRAG_THRESHOLDS.velocity) {
                                    popScreen();
                                }
                            }}
                        >
                            {/* ISOLATION CONTAINER: Decouples animation transforms from internal layout */}
                            {/* This div separates the transform layer from the content flow layer */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAFAF9] flex flex-col">
                                <motion.div
                                    className="flex-1 w-full h-full flex flex-col"
                                    variants={contentStaggerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <ScreenComponent {...screen.props} />
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* --- GLOBAL BOTTOM NAV (Layer 100) --- */}
            {/* Always visible on mobile, sits above everything */}
            <V3BottomNav
                activeTab={activeTab}
                onTabChange={handleNav}
                visible={true}
                className="z-[100]"
            />

            {/* --- BOTTOM SHEET WIDGET MENU --- */}
            <V3WidgetMenu
                isOpen={isWidgetMenuOpen}
                onClose={() => setIsWidgetMenuOpen(false)}
            />

            {/* --- MOCK MORE MENU --- */}
            <V3MoreMenu
                isOpen={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                onNavigate={(id) => navigate(`/v3/${id}`)}
            />
        </div>
    );
}

// Wrapper to provide context
export default function V3Layout(props) {
    return (
        <StackNavigationProvider>
            <V3LayoutContent {...props} />
        </StackNavigationProvider>
    );
}

