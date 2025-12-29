
import React, { useState, useEffect } from 'react';
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

function V3LayoutContent({ children, title, showBack = false, initialActiveTab = 'dashboard' }) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const { stack, popScreen, isWidgetMenuOpen, setIsWidgetMenuOpen } = useStackNavigation();
    const navigate = useNavigate();

    // Calculate depth for root view
    const isRootActive = stack.length === 0;

    const handleNav = (id) => {
        if (id === 'more') {
            setIsMoreOpen(true);
            return;
        }

        // Navigation Logic
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

    // --- ANIMATION VARIANTS ---
    const rootViewVariants = {
        active: {
            scale: 1,
            x: 0,
            opacity: 1,
            borderRadius: "0px",
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        inactive: {
            scale: 0.94,
            x: -30,
            opacity: 0.6,
            borderRadius: "12px",
            overflow: "hidden", // Clip content when rounded
            transition: { type: "spring", stiffness: 300, damping: 30 }
        }
    };

    return (
        <div className="min-h-screen bg-black overflow-hidden relative">
            {/* --- PERSISTENT LIGHTNING ICON --- */}
            <PersistentLightningIcon />

            {/* --- ROOT VIEW CONTAINER --- */}
            <motion.div
                className="h-screen w-full bg-[#FAFAF9] text-[#1C1917] flex flex-col relative"
                variants={rootViewVariants}
                animate={isRootActive ? "active" : "inactive"}
                style={{
                    transformOrigin: "center center",
                    height: '100vh',
                }}
            >
                {/* Top Header - Global */}
                <div className={cn("md:pl-[240px] transition-all duration-200")}>
                    <V3Header
                        title={title}
                        showBack={showBack}
                        onWidgetClick={() => setIsWidgetMenuOpen(true)}
                        // isWidgetActive is now handled by the global icon, header doesn't need to glow
                        isWidgetActive={false}
                    />
                </div>

                {/* Desktop Sidebar */}
                <V3Sidebar activeTab={activeTab} onTabChange={handleNav} />

                {/* Main Content Area */}
                <main className={cn(
                    "pt-16 pb-20 md:pb-8 flex-1 overflow-y-auto custom-scrollbar md:pl-[240px]"
                )}>
                    <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <V3BottomNav activeTab={activeTab} onTabChange={handleNav} />

                {/* Overlay for clicking back to focus */}
                {!isRootActive && (
                    <div
                        className="absolute inset-0 bg-transparent cursor-pointer z-40"
                        onClick={() => {
                            // Optional: clicking backdrop could pop screen
                            // popScreen();
                        }}
                    />
                )}
            </motion.div>

            {/* --- STACKED SCREENS --- */}
            <AnimatePresence>
                {stack.map((screen, index) => {
                    const ScreenComponent = screen.component;
                    return (
                        <motion.div
                            key={screen.id}
                            custom={stack.length - 1 - index}
                            initial={{ x: "100%" }}
                            animate={{
                                x: index === stack.length - 1 ? 0 : -30 * (stack.length - 1 - index),
                                scale: index === stack.length - 1 ? 1 : 1 - (0.06 * (stack.length - 1 - index)),
                                opacity: index === stack.length - 1 ? 1 : 0.6 - (0.1 * (stack.length - 1 - index)),
                                borderRadius: index === stack.length - 1 ? "0px" : "12px",
                                zIndex: 50 + index
                            }}
                            exit={{ x: "100%", zIndex: 100 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-0 bg-white shadow-2xl overflow-hidden"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={{ left: 0.1, right: 0.7 }}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (offset.x > 150 || velocity.x > 500) {
                                    popScreen();
                                }
                            }}
                        >
                            <ScreenComponent {...screen.props} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* --- BOTTOM SHEET WIDGET MENU --- */}
            <V3WidgetMenu
                isOpen={isWidgetMenuOpen}
                onClose={() => setIsWidgetMenuOpen(false)}
            />

            {/* --- OTHER OVERLAYS --- */}
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

