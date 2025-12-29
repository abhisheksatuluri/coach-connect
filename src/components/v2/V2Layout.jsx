import React, { useState, useEffect } from 'react';
import V2NavRail from './V2NavRail';
import V2UtilityDock from './V2UtilityDock';
import V2CommandPalette from './V2CommandPalette';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

export default function V2Layout({ children }) {
    const [isDockOpen, setIsDockOpen] = useState(true);
    const [isCmdOpen, setIsCmdOpen] = useState(false);

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCmdOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <div className="min-h-screen bg-[#0F172A] font-inter text-[#F8FAFC] flex overflow-hidden selection:bg-[#4F46E5] selection:text-white">
            {/* 1. Left Nav Rail (Fixed) */}
            <V2NavRail className="flex-shrink-0" />

            {/* 2. Main Workspace (Fluid) */}
            <main
                className={cn(
                    "flex-1 flex flex-col h-screen transition-all duration-300 ml-[64px]", // Exact width of nav
                    isDockOpen ? "mr-[280px]" : "mr-4" // Exact width of dock
                )}
            >
                {children}
            </main>

            {/* 3. Right Utility Dock (Fixed) */}
            <V2UtilityDock
                isOpen={isDockOpen}
                onToggle={() => setIsDockOpen(!isDockOpen)}
                className="flex-shrink-0 z-40"
            />

            {/* 4. Global Overlays */}
            <V2CommandPalette open={isCmdOpen} onOpenChange={setIsCmdOpen} />
            <Toaster />
        </div>
    );
}
