import React, { useState, useMemo } from 'react';
import { Search, User, Video, Map, CheckSquare, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import V3Overlay from './V3Overlay';

import { useClients } from '@/hooks/useClients';
import { useSessions } from '@/hooks/useSessions';
import { useJourneys } from '@/hooks/useJourneys';
import { useTasks } from '@/hooks/useTasks';
import { useNotebook } from '@/hooks/useNotebook';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

// MOCK_RESULTS removed

export default function V3SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('');

    const { data: clients = [] } = useClients();
    const { data: sessions = [] } = useSessions();
    const { data: journeys = [] } = useJourneys();
    const { data: tasks = [] } = useTasks();
    const { data: notes = [] } = useNotebook();
    const { data: articles = [] } = useKnowledgeBase();

    const filtered = useMemo(() => {
        if (!query) return [];
        const lowerQ = query.toLowerCase();
        const results = [];

        clients.forEach(c => {
            const name = c.name || c.full_name || '';
            if (name.toLowerCase().includes(lowerQ)) {
                results.push({ type: 'Client', icon: User, title: name, subtitle: c.status || 'Active' });
            }
        });

        sessions.forEach(s => {
            if (s.title.toLowerCase().includes(lowerQ)) {
                results.push({ type: 'Session', icon: Video, title: s.title, subtitle: s.date });
            }
        });

        journeys.forEach(j => {
            if (j.title.toLowerCase().includes(lowerQ)) {
                results.push({ type: 'Journey', icon: Map, title: j.title, subtitle: `${j.enrolled?.length || 0} enrolled` });
            }
        });

        tasks.forEach(t => {
            if (t.title.toLowerCase().includes(lowerQ)) {
                results.push({ type: 'Task', icon: CheckSquare, title: t.title, subtitle: t.dueDate });
            }
        });

        notes.forEach(n => {
            if (n.title.toLowerCase().includes(lowerQ)) {
                // Note icon? using Book from lucide if imported or fallback
                results.push({ type: 'Note', icon: CheckSquare, title: n.title, subtitle: 'Notebook' }); // Icon workaround or import Book
            }
        });

        articles.forEach(a => {
            if (a.title.toLowerCase().includes(lowerQ)) {
                results.push({ type: 'Article', icon: Map, title: a.title, subtitle: 'Knowledge Base' }); // Icon workaround
            }
        });

        return results.slice(0, 10);
    }, [query, clients, sessions, journeys, tasks, notes, articles]);

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Search">
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search clients, sessions, notes..."
                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-stone-50 border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-lg transition-all placeholder:text-stone-400"
                    />
                </div>
            </div>

            {query ? (
                <div className="space-y-2">
                    {filtered.length > 0 ? (
                        <>
                            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">Top Matches</h4>
                            {filtered.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group border border-transparent hover:border-stone-100">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:text-teal-600 border border-stone-100">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-stone-900 group-hover:text-teal-900">{item.title}</h3>
                                        <p className="text-xs text-stone-500">{item.subtitle}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-teal-400 -ml-2 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-stone-400">No results found for "{query}"</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 px-1">Recent</h4>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer opacity-70 hover:opacity-100">
                                <User className="w-4 h-4 text-stone-400" />
                                <span className="text-stone-600">Mike Ross</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer opacity-70 hover:opacity-100">
                                <Map className="w-4 h-4 text-stone-400" />
                                <span className="text-stone-600">Sleep Protocol</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 px-1">Quick Actions</h4>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            <button className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 whitespace-nowrap hover:bg-white hover:border-teal-200 hover:text-teal-700 transition-colors">
                                Add Client
                            </button>
                            <button className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 whitespace-nowrap hover:bg-white hover:border-teal-200 hover:text-teal-700 transition-colors">
                                New Session
                            </button>
                            <button className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 whitespace-nowrap hover:bg-white hover:border-teal-200 hover:text-teal-700 transition-colors">
                                Log Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </V3Overlay>
    );
}
