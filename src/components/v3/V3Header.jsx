import React from 'react';
import { Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import V3SearchOverlay from './V3SearchOverlay';
import { useState } from 'react';

export default function V3Header({ title = "Dashboard" }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 z-40 px-4 transition-all duration-300">
                <div className="max-w-[800px] mx-auto h-full flex items-center justify-between">
                    {/* Left: Logo/Brand */}
                    <div className="w-10 h-10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-medium text-sm">Z</span>
                        </div>
                    </div>

                    {/* Center: Title */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-stone-800 font-medium text-base tracking-wide">{title}</h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border border-stone-200 cursor-pointer hover:border-teal-300 transition-colors">
                            <div className="w-full h-full bg-stone-300 flex items-center justify-center text-stone-500 text-xs font-medium">
                                JD
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <V3SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
