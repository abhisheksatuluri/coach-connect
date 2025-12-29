import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import { CheckSquare, Calendar, Flag } from 'lucide-react';

export default function V3Tasks() {
    return (
        <V3Layout title="Tasks" initialActiveTab="more">
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['My Tasks', 'Delegated', 'Completed'].map(f => (
                        <button key={f} className="px-4 py-2 bg-white rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:border-stone-300 hover:text-stone-900 transition-colors">
                            {f}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {[
                        { title: 'Send invoice to Sarah', due: 'Today', priority: 'High', client: 'Sarah Connor' },
                        { title: 'Prepare session notes', due: 'Tomorrow', priority: 'Med', client: 'John Smith' },
                        { title: 'Update availability', due: 'Fri', priority: 'Low', client: '-' },
                    ].map((t, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group">
                            <div className="mt-1 w-5 h-5 rounded-md border-2 border-stone-300 group-hover:border-teal-500 transition-colors" />
                            <div className="flex-1">
                                <div className="font-semibold text-stone-900 text-base">{t.title}</div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.due}</span>
                                    {t.client !== '-' && <span>• {t.client}</span>}
                                    {t.priority === 'High' && <span className="text-rose-500 flex items-center gap-1"><Flag className="w-3 h-3" /> High</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </V3Layout>
    );
}
