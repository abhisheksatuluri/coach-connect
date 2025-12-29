import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import V3Header from './V3Header';
import V3BottomNav from './V3BottomNav';
import V3Sidebar from './V3Sidebar';
import V3Slider from './V3Slider';
import V3MoreMenu from './V3MoreMenu';
import V3WidgetMenu from './widgets/V3WidgetMenu';

// Placeholders for content pages, will be replaced by real imports later
// We use dynamic imports or passing them would be cleaner, but for now 
// we will just assume we render filtered lists inside sliders.
import V3ContactList from './contacts/V3ContactList';
import V3SessionList from './sessions/V3SessionList';
import V3JourneyList from './journeys/V3JourneyList';

// Helper to determine if we are on a detail page
import { useLocation, useNavigate } from 'react-router-dom';

export default function V3Layout({ children, title, showBack = false, initialActiveTab = 'dashboard', initialOpenSlider = null }) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [openSlider, setOpenSlider] = useState(initialOpenSlider); // 'contacts', 'sessions', 'journeys'
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // Safety check just in case mocked files aren't ready
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const handleNav = (id) => {
        if (id === 'more') {
            setIsMoreOpen(true);
            return;
        }

        // Logic: 
        // If Dashboard is clicked -> Close all, go home
        // If Entity is clicked -> Open Slider (don't navigate away from current page underlay necessarily)
        // OR if navigate is preferred, we can navigate.
        // Hybrid Zen: Stay on page, open slider.

        if (id === 'dashboard') {
            setActiveTab('dashboard');
            setOpenSlider(null);
            // Optionally navigate to dashboard if not there
            // navigate('/v3/dashboard'); 
        } else if (['contacts', 'sessions', 'journeys'].includes(id)) {
            setActiveTab(id);
            // Toggle behavior or always open?
            // User Requirement: "Tap same nav icon again: Reopens slider"
            if (openSlider === id) {
                setOpenSlider(null); // Toggle close
            } else {
                setOpenSlider(id);
            }
        } else {
            setActiveTab(id);
        }
    };

    const closeSlider = () => {
        setOpenSlider(null);
        // Reset active tab to dashboard if we closed a slider? 
        // Or keep it highlighted? Zen says visually consistent. 
        // Let's keep it highlighted if we assume we are "in" that section, 
        // but maybe reverting to dashboard visual is cleaner if the main view is dashboard.
        // For now, leave as is.
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] font-sans antialiased">
            {/* Top Header - Global */}
            <div className={cn("md:pl-[240px] transition-all duration-200")}>
                <V3Header
                    title={title}
                    showBack={showBack}
                    onWidgetClick={() => setIsWidgetOpen(true)}
                />
            </div>

            {/* Desktop Sidebar */}
            <V3Sidebar activeTab={activeTab} onTabChange={handleNav} />

            {/* Main Content Area */}
            <main className={cn(
                "pt-16 pb-20 md:pb-8 min-h-screen transition-all duration-200",
                "md:pl-[240px]" // Offset for Sidebar
            )}>
                <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <V3BottomNav activeTab={activeTab} onTabChange={handleNav} />

            {/* --- SLIDERS (The Zen Lists) --- */}

            <V3Slider
                isOpen={openSlider === 'contacts'}
                onClose={closeSlider}
                title="Contacts"
            >
                <V3ContactList onCloseSlider={closeSlider} />
            </V3Slider>

            <V3Slider
                isOpen={openSlider === 'sessions'}
                onClose={closeSlider}
                title="Sessions"
            >
                <V3SessionList onCloseSlider={closeSlider} />
            </V3Slider>

            <V3Slider
                isOpen={openSlider === 'journeys'}
                onClose={closeSlider}
                title="Journeys"
            >
                <V3JourneyList onCloseSlider={closeSlider} />
            </V3Slider>


            {/* --- OVERLAYS --- */}

            <V3MoreMenu
                isOpen={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                onNavigate={(id) => navigate(`/v3/${id}`)}
            />

            <V3WidgetMenu
                isOpen={isWidgetOpen}
                onClose={() => setIsWidgetOpen(false)}
                onAction={(action) => console.log('Widget Action:', action)}
            />
        </div>
    );
}
