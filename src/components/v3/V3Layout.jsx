
import React, { useState } from 'react';
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
// Polished spring physics for that "layered" feel
const SPRING_MAIN = { type: "spring", stiffness: 280, damping: 26, mass: 1 };
const SPRING_TIGHT = { type: "spring", stiffness: 350, damping: 30, mass: 1 }; // Snappier for desktop if needed
const SPRING_SETTLE = { type: "spring", stiffness: 400, damping: 30, mass: 1 }; // Quick settlement

const DRAG_THRESHOLDS = {
    cancel: 120, // Reduced slightly for better responsiveness
    velocity: 400
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
        scale: 0.94 - (index * 0.04), // 0.94, 0.90
        x: -20 + (index * -8), // Subtle shift left
        opacity: 0.6 - (index * 0.1), // Dimming
        filter: "blur(4px)", // Progressive blur
        borderRadius: "16px",
        transition: {
            ...SPRING_MAIN,
            delay: 0.02 // Anticipation phase: background reacts slightly before foreground
        }
    })
};

// The "Foreground" entering/exiting screen
const screenVariants = {
    initial: {
        x: "100%",
        scale: 1.02, // Start slightly zoomed in (Anticipation)
        boxShadow: "0 0 0px rgba(0,0,0,0)",
        opacity: 1
    },
    animate: {
        x: 0,
        scale: 1,
        boxShadow: "-10px 0px 50px rgba(0,0,0,0.2)", // Deep shadow
        opacity: 1,
        transition: {
            x: { ...SPRING_MAIN, delay: 0.05 }, // Slide in after tiny delay
            scale: { ...SPRING_SETTLE, delay: 0.25 }, // Settle scale later
            boxShadow: { duration: 0.4 }
        }
    },
    exit: {
        x: "100%",
        scale: 1.01, // Lift effect on exit
        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
        transition: { ...SPRING_MAIN }
    }
};

// Content Stagger (Fade in parts after screen lands)
const contentStaggerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.3, // Wait for slide-in
            duration: 0.2,
            ease: "easeOut"
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
        if (id === activeTab && !isRootActive) {
            clearStack();
            return;
        }

        if (id === 'dashboard') {
            setActiveTab('dashboard');
            if (!isRootActive) clearStack();
        } else {
            setActiveTab(id);
            if (['contacts', 'sessions', 'journeys', 'tasks', 'payments', 'notebook'].includes(id)) {
                // If we are already on this tab but deep in stack, clear stack? 
                // User requirement: "Sidebar reflects which main section... Content area Contact list slides in"
                // Actually, if we navigate to /v3/contacts, we just want the base list.
                navigate(`/v3/${id}`);
                clearStack(); // Ensure we start fresh on the new section
            }
        }
    };

    return (
        <div className="min-h-screen bg-black overflow-hidden relative selection:bg-teal-100 selection:text-teal-900 flex">

            {/* --- PERSISTENT LIGHTNING ICON --- */}
            {/* Adjusted z-index to stay above sidebar on mobile but respect layout on desktop involved? 
                Actually, putting it here makes it global. */}
            <PersistentLightningIcon />

            {/* --- SIDEBAR (Desktop Only) --- */}
            {/* Fixed position, always visible on MD+ */}
            {/* z-index 60 to sit above content but below modals if they were global, however stack is local now */}
            <V3Sidebar
                activeTab={activeTab}
                onTabChange={handleNav}
                className="hidden md:flex z-50"
            />

            {/* --- CONTENT AREA (The Stacking Context) --- */}
            {/* Pushed right by 240px on Desktop */}
            <div className="flex-1 h-screen relative flex flex-col md:ml-[240px] bg-black">

                {/* --- ROOT VIEW CONTAINER (Base Layer) --- */}
                <motion.div
                    className="absolute inset-0 w-full h-full bg-[#FAFAF9] text-[#1C1917] flex flex-col will-change-transform origin-center overflow-hidden"
                    variants={backgroundVariants}
                    animate={isRootActive ? "active" : "inactive"}
                    custom={0}
                    style={{ touchAction: 'none' }} // Prevent browser swipe nav
                >
                    {/* Header */}
                    {showHeader && (
                        <div className="w-full">
                            <V3Header
                                title={title}
                                showBack={showBack}
                                isWidgetActive={false}
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    <main className={cn(
                        "flex-1 overflow-hidden flex flex-col",
                        showHeader ? "pt-16" : "pt-0",
                        "pb-0 md:pb-0" // Clean bottom
                    )}>
                        <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-stretch h-full">
                            {children}
                        </div>
                    </main>

                    {/* Overlay for clicking back to focus (Dimming) */}
                    {!isRootActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/10 z-40 cursor-pointer backdrop-blur-[1px]"
                            onClick={() => popScreen()}
                        />
                    )}
                </motion.div>

                {/* --- STACKED SCREENS (Layers 1+) --- */}
                {/* Contained within this div, so they don't cover the sidebar on desktop */}
                <AnimatePresence mode='popLayout'>
                    {stack.map((screen, index) => {
                        const ScreenComponent = screen.component;
                        const isTop = index === stack.length - 1;
                        const depthIndex = stack.length - 1 - index;

                        return (
                            <motion.div
                                key={screen.id}
                                className="absolute inset-0 bg-white overflow-hidden shadow-2xl"
                                style={{ zIndex: 50 + index }}
                                variants={isTop ? screenVariants : backgroundVariants}
                                initial={isTop ? "initial" : false}
                                animate={isTop ? "animate" : "inactive"}
                                exit="exit"
                                custom={depthIndex}
                                drag={isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={{ left: 0.1, right: 0.7 }}
                                onDragEnd={(e, { offset, velocity }) => {
                                    if (offset.x > DRAG_THRESHOLDS.cancel || velocity.x > DRAG_THRESHOLDS.velocity) {
                                        popScreen();
                                    }
                                }}
                            >
                                {/* Content Isolation */}
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
            </div>

            {/* --- GLOBAL BOTTOM NAV (Mobile Only) --- */}
            {/* Hidden on MD+ via `md:hidden` in component/className */}
            <V3BottomNav
                activeTab={activeTab}
                onTabChange={handleNav}
                visible={true}
                className="z-[100] md:hidden"
            />

            {/* --- WIDGET MENUS --- */}
            {/* These are global overlays, so they CAN cover the sidebar if needed, 
                but usually standard practice is centered or bottom sheet.
                Current V3WidgetMenu is a bottom sheet. */}
            <V3WidgetMenu
                isOpen={isWidgetMenuOpen}
                onClose={() => setIsWidgetMenuOpen(false)}
            />

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
