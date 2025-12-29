import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2KnowledgeBaseCard from '@/components/v2/knowledgebase/V2KnowledgeBaseCard';
import V2KnowledgeBaseDetail from '@/components/v2/knowledgebase/V2KnowledgeBaseDetail';
import { Plus, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

// MOCK_ARTICLES removed in favor of hook



const KnowledgeBaseListContent = ({ articles, selectedId, onSelect }) => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredArticles = activeFilter === 'All' ? articles : articles.filter(a => a.category === activeFilter);

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
                        <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{articles.length}</span>
                    </div>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                        <Plus className="w-3 h-3" /> New Article
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full bg-slate-800 border-0 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 pb-2">
                    {['All', 'Protocols', 'Mindset', 'Nutrition', 'Exercise'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded transition-colors border",
                                activeFilter === filter
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                    : "bg-slate-800 border-transparent text-slate-400 hover:text-white"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filteredArticles.map(article => (
                    <V2KnowledgeBaseCard
                        key={article.id}
                        article={article}
                        isSelected={selectedId === article.id}
                        onClick={() => onSelect(article.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function V2KnowledgeBase() {
    const { data: articles = [], isLoading } = useKnowledgeBase();
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const selectedArticle = articles.find(a => a.id === selectedArticleId) || articles[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedArticleId && articles.length > 0) {
            setSelectedArticleId(articles[0].id);
        }
    }, [articles, selectedArticleId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading knowledge base...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <KnowledgeBaseListContent
                        articles={articles}
                        selectedId={selectedArticleId || (articles[0]?.id)}
                        onSelect={setSelectedArticleId}
                    />
                }
                secondaryContent={
                    <V2KnowledgeBaseDetail article={selectedArticle} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
