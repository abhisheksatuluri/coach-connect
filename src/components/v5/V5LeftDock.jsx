import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Map, Users, Video, CheckSquare, Book, LayoutGrid, CreditCard, UserPlus } from 'lucide-react';

const ENTITY_FILTERS = [
    { id: 'Clients', label: 'Clients', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500', pastel: 'bg-blue-100' },
    { id: 'Sessions', label: 'Sessions', icon: Video, color: 'text-violet-500', bg: 'bg-violet-500', pastel: 'bg-violet-100' },
    { id: 'Journeys', label: 'Journeys', icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-500', pastel: 'bg-emerald-100' },
    { id: 'Tasks', label: 'Tasks', icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-500', pastel: 'bg-amber-100' },
    { id: 'Notebook', label: 'Notebook', icon: Book, color: 'text-pink-500', bg: 'bg-pink-500', pastel: 'bg-pink-100' },
    { id: 'Knowledge', label: 'Knowledge Base', icon: LayoutGrid, color: 'text-indigo-500', bg: 'bg-indigo-500', pastel: 'bg-indigo-100' },
    { id: 'Payments', label: 'Payments', icon: CreditCard, color: 'text-teal-500', bg: 'bg-teal-500', pastel: 'bg-teal-100' },
    { id: 'Practitioners', label: 'Practitioners', icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-500', pastel: 'bg-orange-100' },
];

export default function V5LeftDock({ activeFilters = [], onToggleFilter, className }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={cn(
            "fixed left-4 top-16 bottom-4 bg-white/90 backdrop-blur-sm border border-stone-200 shadow-xl rounded-2xl z-40 transition-all duration-300 flex flex-col overflow-hidden",
            collapsed ? "w-16" : "w-64",
            className
        )}>
            {/* Header / Toggle */}
            <div className="h-12 border-b border-stone-100 flex items-center justify-between px-3 shrink-0">
                {!collapsed && (
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-2">
                        Canvas Layers
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors ml-auto"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Filters List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {ENTITY_FILTERS.map(filter => {
                    const isActive = activeFilters.includes(filter.id);
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onToggleFilter(filter.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all group relative",
                                isActive ? "bg-white shadow-sm border border-stone-200" : "hover:bg-stone-50 opacity-60 hover:opacity-100"
                            )}
                            title={collapsed ? filter.label : undefined}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isActive ? filter.pastel : "bg-stone-100 group-hover:bg-stone-200"
                            )}>
                                <filter.icon className={cn("w-4 h-4", isActive ? filter.color : "text-stone-400")} />
                            </div>

                            {!collapsed && (
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive ? "text-stone-900" : "text-stone-500"
                                )}>
                                    {filter.label}
                                </span>
                            )}

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <div className={cn("absolute w-1.5 h-1.5 rounded-full right-2 top-1/2 -translate-y-1/2", filter.bg)} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Minimap Placeholder */}
            {!collapsed && (
                <div className="p-3 border-t border-stone-100 bg-stone-50/50">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Minimap</div>
                    <div className="aspect-video bg-stone-200 rounded-lg border border-stone-300 relative overflow-hidden group cursor-pointer hover:bg-stone-300 transition-colors">
                        <div className="absolute inset-4 border-2 border-indigo-500/30 rounded-sm" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full" />
                    </div>
                </div>
            )}
        </div>
    );
}
