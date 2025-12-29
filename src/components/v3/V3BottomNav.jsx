import React from 'react';
import { Home, Users, Calendar, Map, Grid } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3BottomNav({ activeTab, onTabChange, visible = true, className }) {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'contacts', icon: Users, label: 'Contacts' },
        { id: 'sessions', icon: Calendar, label: 'Sessions' },
        { id: 'journeys', icon: Map, label: 'Journeys' },
        { id: 'more', icon: Grid, label: 'More' },
    ];

    return (
        <nav
            className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200 z-[60] flex items-center justify-around px-2 pb-safe transition-all duration-300 ease-out",
                visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-80 pointer-events-none",
                className
            )}
        >
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform"
                    >
                        <div className={cn(
                            "relative p-1.5 rounded-xl transition-colors",
                            isActive ? "bg-teal-50 text-teal-700" : "text-stone-400"
                        )}>
                            <Icon className={cn("w-6 h-6", isActive && "fill-teal-700/20")} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-600 rounded-full ring-2 ring-white" />
                            )}
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium transition-colors",
                            isActive ? "text-teal-700" : "text-stone-400"
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
