import React from 'react';
import { Home, Users, Calendar, Map, Grid, LogOut, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3Sidebar({ activeTab, onTabChange }) {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'contacts', icon: Users, label: 'Contacts' },
        { id: 'sessions', icon: Calendar, label: 'Sessions' },
        { id: 'journeys', icon: Map, label: 'Journeys' },
    ];

    return (
        <div className="hidden md:flex flex-col w-[240px] fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 z-50 pt-16 pb-4">
            {/* Nav Items */}
            <div className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                            )}
                        >
                            <div className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                isActive ? "bg-teal-600" : "bg-transparent group-hover:bg-stone-300"
                            )} />
                            <Icon className={cn("w-5 h-5", isActive ? "fill-teal-700/20" : "")} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}

                <div className="my-4 border-t border-stone-100 mx-3" />

                <button
                    onClick={() => onTabChange('more')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                    )}
                >
                    <div className="w-2 h-2 rounded-full bg-transparent" />
                    <Grid className="w-5 h-5" />
                    <span className="font-medium text-sm">More Tools</span>
                </button>
            </div>

            {/* Footer / User */}
            <div className="px-4 mt-auto">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors border border-transparent hover:border-stone-100">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                        JD
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-medium text-stone-900 truncate">Jane Doe</div>
                        <div className="text-xs text-stone-500 truncate">Coach</div>
                    </div>
                    <Settings className="w-4 h-4 text-stone-400" />
                </div>
            </div>
        </div>
    );
}
