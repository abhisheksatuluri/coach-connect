
import React, { useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ChevronRight, BookOpen } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { knowledgeBaseData } from '@/data/v3DummyData';

// Placeholder for Article Detail
function V3ArticleDetail({ article }) {
    const { popScreen } = useStackNavigation();

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={popScreen} className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="text-sm font-medium text-stone-500 truncate max-w-[200px]">{article.category}</div>
                </div>
                <button className="text-teal-600 font-medium text-sm">Share</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
                <span className="inline-block px-3 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-600 mb-4 uppercase tracking-wider">
                    Matched {article.matchCount} times
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6 leading-tight">
                    {article.title}
                </h1>

                <div className="prose prose-stone prose-lg">
                    <p className="lead text-xl text-stone-600">{article.preview}</p>
                    <p>{article.content}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <h3>Key Takeaways</h3>
                    <ul>
                        <li>Understanding the core concepts is crucial for long term success.</li>
                        <li>Consistency trumps intensity when building new habits.</li>
                        <li>Tracking progress helps in maintaining motivation.</li>
                    </ul>
                </div>

                <div className="mt-12 pt-8 border-t border-stone-200">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Matched Sessions</h3>
                    <div className="space-y-2">
                        <div className="p-3 bg-white border border-stone-200 rounded-lg flex justify-between items-center">
                            <div>
                                <div className="font-medium text-stone-900">Weekly Check-in</div>
                                <div className="text-xs text-stone-500">Sarah Mitchell • 2 days ago</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                        </div>
                    </div>
                </div>

                <div className="h-20"></div>
            </div>
        </div>
    )
}

export default function V3KnowledgeBase() {
    const { popScreen, pushScreen } = useStackNavigation();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Nutrition', 'Exercise', 'Mindset', 'Sleep', 'Protocols'];

    const filteredArticles = knowledgeBaseData.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-[#f5f5f4]">
            {/* Header */}
            <div className="flex-none bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={popScreen} className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className="text-lg font-semibold text-stone-900">Knowledge Base</h1>
                    </div>
                    <button className="p-2 text-stone-400 hover:text-stone-600"><SlidersHorizontal className="w-5 h-5" /></button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-stone-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                activeCategory === cat
                                    ? "bg-stone-900 text-white border-stone-900"
                                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredArticles.map(article => (
                    <button
                        key={article.id}
                        onClick={() => pushScreen(V3ArticleDetail, { article })}
                        className="w-full bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-left group active:scale-[0.98]"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                article.category === 'Nutrition' ? "bg-green-100 text-green-700" :
                                    article.category === 'Mindset' ? "bg-purple-100 text-purple-700" :
                                        "bg-stone-100 text-stone-600"
                            )}>
                                {article.category}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">Matches: {article.matchCount}</span>
                        </div>
                        <h3 className="font-bold text-stone-900 mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">{article.title}</h3>
                        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{article.preview}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Also export ArticleDetail for direct use if needed
export { V3ArticleDetail };
