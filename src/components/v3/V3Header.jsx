import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';

export default function V3Header({ title, onWidgetClick, showBack = false }) {
    const navigate = useNavigate();

    return (
        <header className="h-14 md:h-16 fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-40 flex items-center justify-between px-4 transition-all duration-200">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-lg md:text-xl font-semibold text-stone-900 tracking-tight">
                    {title || 'Coach Connext'}
                </h1>
            </div>

            <button
                onClick={onWidgetClick}
                className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500 hover:text-teal-600 hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100"
                title="Supercharger"
            >
                <Zap className="w-5 h-5 fill-current" />
            </button>
        </header>
    );
}
