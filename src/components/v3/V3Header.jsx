import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';

export default function V3Header({ title, showBack = false }) {
    const navigate = useNavigate();

    return (
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-0 sticky top-0 z-[60] bg-[#FAFAF9]/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-2 md:hidden">
                {/* Mobile Menu Trigger or other items if needed */}
            </div>
            {/* Desktop spacer or actions */}
            <div className="hidden md:flex items-center gap-4">
                {/* Placeholders for desktop specific header actions if any */}
            </div>
        </header>
    );
}
