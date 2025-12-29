import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import V3Layout from '@/components/v3/V3Layout';
import { useClient } from '@/hooks/useClients';
import {
    Calendar, Map, CheckSquare, CreditCard, FileText,
    ChevronDown, ChevronUp, Plus, Star, Phone, Mail, Globe
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Collapsible Section Component
const DetailSection = ({ title, icon: Icon, count, children, onAdd }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-stone-900">{title}</h3>
                    {count !== undefined && (
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onAdd && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(); }}
                            className="text-stone-400 hover:text-teal-600 p-1 hover:bg-teal-50 rounded transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
            </div>
            {isOpen && (
                <div className="p-4 pt-0 border-t border-stone-50">
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function V3ContactDetail() {
    const { id } = useParams();
    // Assuming useClient hook exists and takes ID
    const { data: client, isLoading } = useClient(id);

    // Fallback/Mock if API fails during dev
    const mockClient = {
        id: 1,
        name: 'Sarah Connor',
        role: 'Client',
        status: 'Active',
        avatar: 'SC',
        tags: ['High Priority', 'Sleep Focus'],
        email: 'sarah@example.com',
        phone: '555-0123',
        sessions: [
            { id: 1, title: 'Weekly Check-in', date: 'Oct 24', status: 'Completed' },
            { id: 2, title: 'Goal Setting', date: 'Oct 10', status: 'Completed' }
        ],
        tasks: [
            { id: 1, title: 'Complete intake form', due: 'Tomorrow', status: 'Pending' }
        ]
    };

    const data = client || mockClient;

    if (isLoading) return <V3Layout><div className="p-8 text-center text-stone-500">Loading...</div></V3Layout>;

    return (
        <V3Layout title="Contact Details" showBack={true} initialActiveTab="contacts">
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-2xl border-4 border-white shadow-sm ring-1 ring-stone-100">
                        {data.avatar || data.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{data.name}</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                data.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                            )}>
                                {data.status}
                            </span>
                        </div>
                        <div className="text-stone-500 font-medium mb-3">{data.role || 'Client'}</div>

                        <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                            {data.email && (
                                <div className="flex items-center gap-1.5 hover:text-teal-600 cursor-pointer transition-colors">
                                    <Mail className="w-4 h-4" /> {data.email}
                                </div>
                            )}
                            {data.phone && (
                                <div className="flex items-center gap-1.5 hover:text-teal-600 cursor-pointer transition-colors">
                                    <Phone className="w-4 h-4" /> {data.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags Row */}
                {data.tags && (
                    <div className="flex gap-2 mb-6">
                        {data.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-stone-100 rounded-lg text-stone-600 text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                        <button className="px-3 py-1 border border-stone-200 border-dashed rounded-lg text-stone-400 text-xs hover:border-teal-500 hover:text-teal-600 transition-colors">
                            + Tag
                        </button>
                    </div>
                )}

                {/* Sections */}

                <DetailSection title="Sessions" icon={Calendar} count={data.sessions?.length} onAdd={() => console.log('Add Session')}>
                    {data.sessions?.length > 0 ? (
                        <div className="space-y-2">
                            {data.sessions.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
                                    <div>
                                        <div className="font-semibold text-stone-900">{s.title}</div>
                                        <div className="text-xs text-stone-500">{s.date}</div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-stone-400 bg-white px-2 py-1 rounded border border-stone-100">
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 border-2 border-dashed border-stone-100 rounded-xl">
                            <p className="text-stone-400 text-sm mb-3">No sessions scheduled yet.</p>
                            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Schedule First Session
                            </button>
                        </div>
                    )}
                </DetailSection>

                <DetailSection title="Journeys" icon={Map} count={0} onAdd={() => console.log('Assign Journey')}>
                    <div className="text-center p-6 border-2 border-dashed border-stone-100 rounded-xl">
                        <p className="text-stone-400 text-sm mb-3">Not enrolled in any journeys.</p>
                        <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                            Browse Journeys
                        </button>
                    </div>
                </DetailSection>

                <DetailSection title="Tasks" icon={CheckSquare} count={data.tasks?.length} onAdd={() => console.log('Add Task')}>
                    {data.tasks?.length > 0 ? (
                        <div className="space-y-2">
                            {data.tasks.map(t => (
                                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-teal-200 transition-colors group bg-white">
                                    <div className="w-5 h-5 rounded border border-stone-300 group-hover:border-teal-500 flex items-center justify-center cursor-pointer">
                                        {/* Checkbox mock */}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-stone-700 group-hover:text-stone-900">{t.title}</span>
                                    <span className="text-xs text-rose-500 font-medium">{t.due}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-stone-400 text-sm italic">No open tasks.</div>
                    )}
                </DetailSection>

                <DetailSection title="Notes" icon={FileText} count={2} onAdd={() => console.log('Add Note')}>
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-sm text-stone-700 leading-relaxed">
                            <span className="font-bold text-stone-900 block mb-1 text-xs uppercase tracking-wide opacity-50">Pinned Note</span>
                            Client prefers morning sessions. Always double check timezone (PST).
                        </div>
                    </div>
                </DetailSection>

            </div>
        </V3Layout>
    );
}
