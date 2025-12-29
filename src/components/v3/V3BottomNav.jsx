import React, { useState } from 'react';
import { Home, Users, Video, Map, MoreHorizontal, LayoutGrid, CheckSquare, Book, CreditCard, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import V3Overlay from './V3Overlay';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', path: '/v3', exact: true },
    { icon: Users, label: 'Clients', path: '/v3/clients' },
    { icon: Video, label: 'Sessions', path: '/v3/sessions' },
    { icon: Map, label: 'Journeys', path: '/v3/journeys' },
];

const MORE_ITEMS = [
    { icon: CheckSquare, label: 'Tasks', path: '/v3/tasks' },
    { icon: Book, label: 'Notebook', path: '/v3/notebook' },
    { icon: LayoutGrid, label: 'Knowledge', path: '/v3/knowledge-base' },
    { icon: CreditCard, label: 'Payments', path: '/v3/payments' },
];

export default function V3BottomNav() {
    const location = useLocation();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#E7E5E4] z-40 px-4 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                <div className="max-w-[800px] mx-auto h-full flex items-center justify-around">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex-1 flex flex-col items-center justify-center gap-1 group relative h-full"
                            >
                                <item.icon
                                    className={cn(
                                        "w-[24px] h-[24px] transition-all duration-300",
                                        isActive ? "text-[#0F766E]" : "text-[#A8A29E] group-hover:text-[#57534E]"
                                    )}
                                />
                                {isActive && (
                                    <div className="absolute bottom-[12px] w-1 h-1 rounded-full bg-[#0F766E]" />
                                )}
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    <button
                        className="flex-1 flex flex-col items-center justify-center gap-1 group h-full"
                        onClick={() => setIsMoreOpen(true)}
                    >
                        <MoreHorizontal
                            className={cn(
                                "w-[24px] h-[24px] transition-all duration-300",
                                isMoreOpen ? "text-[#0F766E]" : "text-[#A8A29E] group-hover:text-[#57534E]"
                            )}
                        />
                    </button>
                </div>
            </nav>

            {/* More Menu Overlay */}
            <V3Overlay
                isOpen={isMoreOpen}
                onClose={() => setIsMoreOpen(false)}
                title="More Tools"
            >
                <div className="grid grid-cols-2 gap-4">
                    {MORE_ITEMS.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMoreOpen(false)}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#D6D3D1] transition-all duration-200 gap-3 group"
                        >
                            <div className="p-3 bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#E7E5E4] group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-6 h-6 text-[#57534E]" />
                            </div>
                            <span className="text-sm font-medium text-[#1C1917]">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </V3Overlay>
        </>
    );
}
