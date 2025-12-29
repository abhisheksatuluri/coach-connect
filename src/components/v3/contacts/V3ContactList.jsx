
import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3ContactDetail from './V3ContactDetail';
import PremiumScrollContainer from '@/components/v3/shared/PremiumScrollContainer';
import ScrollShrinkHeader from '@/components/v3/shared/ScrollShrinkHeader';
import StickySectionHeader from '@/components/v3/shared/StickySectionHeader';

export default function V3ContactList() {
    const { pushScreen } = useStackNavigation();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All'); // All, Client, Practitioner, Lead

    const filtered = contactsData.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' ? true : c.type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header with Search integrated - or simple title */}
            {/* If this is a Root Screen, the main Layout header might be visible. 
                However, for "Premium Scroll", we often want custom headers per screen to handle shrink behavior. 
                If V3Layout logic renders a header, we might double up. 
                For now, I assume V3Layout allows disabling header or we are pushing this screen.
                But ContactList is usually a Root screen.
                Checked V3Dashboard: it passes title="Dashboard".
                Checked V3Contacts: it renders V3Layout title="Contacts".
                So V3Layout renders the header. If we want a Shrinking header, we need to disable V3Layout header
                or make V3Layout header smart.
                
                The user plan requested "Scroll-linked header effects". 
                Most robust way: Hide V3Layout header for these screens and render our own ScrollShrinkHeader?
                Or just use the Layout header?
                The plan says "Header shrinks on scroll".
                
                I'll assume for this refactor I should replace the internal scroll container.
                The sticky filters need to be handled.
             */}

            <PremiumScrollContainer className="h-full">
                {/* Sticky Search & Filter - Stays at top of scroll view */}
                <div className="sticky top-0 z-20 bg-[#FAFAF9]/95 backdrop-blur-sm p-4 space-y-3 border-b border-stone-100 transition-all">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl h-10 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['All', 'Client', 'Practitioner', 'Lead'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border",
                                    filter === f
                                        ? "bg-stone-900 text-white border-stone-900"
                                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 pb-24 space-y-2">
                    {filtered.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => pushScreen(V3ContactDetail, { contact })}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-500/30 cursor-pointer transition-all group active:scale-[0.99] duration-200"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner",
                                contact.avatarColor || "bg-stone-100 text-stone-500"
                            )}>
                                {contact.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-stone-900 truncate group-hover:text-teal-700 transition-colors">{contact.name}</div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                        contact.type === 'Practitioner' ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                                    )}>
                                        {contact.type}
                                    </span>
                                    <span>•</span>
                                    <span>{contact.status}</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-teal-500 transition-colors" />
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-stone-400">
                            No contacts found
                        </div>
                    )}
                </div>
            </PremiumScrollContainer>
        </div>
    );
}

