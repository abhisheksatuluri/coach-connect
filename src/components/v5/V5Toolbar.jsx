import React from 'react';
import { Home, Search, ZoomIn, ZoomOut, Maximize, Filter, User } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V5Toolbar({ zoom, setZoom, onResetView, className }) {
    return (
        <div className={cn("fixed top-0 left-0 right-0 h-12 bg-white border-b border-stone-200 shadow-sm z-50 flex items-center justify-between px-4", className)}>
            {/* Left: Branding & Home */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        Z5
                    </div>
                    <span className="font-semibold text-stone-900 tracking-tight">Spatial Canvas</span>
                </div>
                <div className="h-6 w-px bg-stone-200" />
                <button
                    onClick={onResetView}
                    className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                    <Home className="w-5 h-5" />
                </button>
            </div>

            {/* Center: View Controls */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200 shadow-inner">
                <button
                    onClick={() => setZoom(z => Math.max(0.25, z - 0.1))}
                    className="p-1.5 rounded-md text-stone-500 hover:bg-white hover:text-stone-900 transition-colors"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <div className="px-3 text-xs font-medium text-stone-600 min-w-[3rem] text-center select-none">
                    {Math.round(zoom * 100)}%
                </div>
                <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                    className="p-1.5 rounded-md text-stone-500 hover:bg-white hover:text-stone-900 transition-colors"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-stone-300 mx-1" />
                <button
                    onClick={onResetView}
                    className="p-1.5 rounded-md text-stone-500 hover:bg-white hover:text-stone-900 transition-colors"
                    title="Fit to Screen"
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search canvas..."
                        className="pl-9 pr-4 py-1.5 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 transition-all"
                    />
                </div>
                <button className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                    <Filter className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold border border-stone-300">
                    <User className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
