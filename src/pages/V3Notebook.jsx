import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import { Book, Search } from 'lucide-react';

export default function V3Notebook() {
    return (
        <V3Layout title="Notebook" initialActiveTab="more">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search your notes..."
                        className="w-full bg-white border-none rounded-2xl h-14 pl-12 pr-4 text-base shadow-sm focus:ring-1 focus:ring-teal-500"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { title: 'Sleep Protocol Ideas', preview: 'Research into Circadian entrainment using light therapy...', date: '2d ago', tag: 'Research' },
                        { title: 'Meeting Notes - Sarah', preview: 'Key takeaways from intake: High stress, poor sleep hygiene...', date: '5d ago', tag: 'Client' },
                        { title: 'Q4 Goals', preview: 'Revenue targets and marketing spend allocation...', date: '1w ago', tag: 'Business' },
                    ].map((note, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-stone-100 hover:border-teal-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-48">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-stone-50 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                    <Book className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase text-stone-400 border border-stone-100 px-2 py-1 rounded-full">{note.tag}</span>
                            </div>
                            <h3 className="font-bold text-stone-900 text-lg mb-2 group-hover:text-teal-700 transition-colors">{note.title}</h3>
                            <p className="text-stone-500 text-sm line-clamp-2 flex-1">{note.preview}</p>
                            <div className="text-xs text-stone-400 mt-4">{note.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </V3Layout>
    );
}
