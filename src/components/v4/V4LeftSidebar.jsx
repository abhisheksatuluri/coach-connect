import React from 'react';
import { Home, Plus, Users, Video, Map, CheckSquare, Book, LayoutGrid, CreditCard, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils";

const ENTITY_FILTERS = [
    { id: 'Clients', label: 'Clients', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500' },
    { id: 'Sessions', label: 'Sessions', icon: Video, color: 'text-violet-500', bg: 'bg-violet-500' },
    { id: 'Journeys', label: 'Journeys', icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { id: 'Tasks', label: 'Tasks', icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-500' },
    { id: 'Notebook', label: 'Notebook', icon: Book, color: 'text-pink-500', bg: 'bg-pink-500' },
    { id: 'Knowledge', label: 'Knowledge Base', icon: LayoutGrid, color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { id: 'Payments', label: 'Payments', icon: CreditCard, color: 'text-teal-500', bg: 'bg-teal-500' },
    { id: 'Practitioners', label: 'Practitioners', icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-500' },
];

export default function V4LeftSidebar({ activeFilter, onFilterChange, className }) {
    return (
        <aside className={cn("w-[240px] h-screen bg-white border-r border-stone-200 flex flex-col p-4", className)}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white font-bold text-sm">
                    Z4
                </div>
                <span className="font-semibold text-stone-900 text-lg tracking-tight">Living Feed</span>
            </div>

            {/* Main Nav */}
            <nav className="space-y-1 mb-8">
                <button
                    onClick={() => onFilterChange('All')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeFilter === 'All'
                            ? "bg-stone-100 text-stone-900"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    )}
                >
                    <Home className="w-5 h-5 text-stone-400" />
                    Home
                </button>
            </nav>

            {/* Entity Filters */}
            <div className="mb-4 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Entities
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
                {ENTITY_FILTERS.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                            activeFilter === filter.id
                                ? "bg-stone-50 text-stone-900"
                                : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            filter.bg,
                            activeFilter === filter.id ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                        )} />
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-stone-100">
                <button className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    New Activity
                </button>
            </div>
        </aside>
    );
}
