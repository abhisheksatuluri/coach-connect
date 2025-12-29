import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import { FileText, Search } from 'lucide-react';

export default function V3KnowledgeBase() {
    return (
        <V3Layout title="Knowledge Base" initialActiveTab="more">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search protocols & articles..."
                        className="w-full bg-white border-none rounded-2xl h-14 pl-12 pr-4 text-base shadow-sm focus:ring-1 focus:ring-teal-500"
                    />
                </div>

                <div className="space-y-2">
                    {[
                        { title: 'Sleep Hygiene Protocol v2', cat: 'Protocol', reads: 42 },
                        { title: 'Box Breathing Technique', cat: 'Tool', reads: 128 },
                        { title: 'High Protein Breakfasts', cat: 'Nutrition', reads: 56 },
                    ].map((art, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between hover:border-teal-200 hover:shadow-sm cursor-pointer transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-stone-900">{art.title}</h3>
                                    <div className="text-xs text-stone-500">{art.cat}</div>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-stone-400">{art.reads} reads</div>
                        </div>
                    ))}
                </div>
            </div>
        </V3Layout>
    );
}
