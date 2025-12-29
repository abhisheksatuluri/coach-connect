import React, { useState } from 'react';
import { Edit3, Share2, Trash, Zap, ArrowRight, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

export default function V3KnowledgeBaseOverlay({ article, isOpen, onClose }) {
    if (!article) return null;

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Article">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-100/80 border border-stone-200 text-stone-600 text-xs font-medium uppercase tracking-wider">
                        {article.category}
                    </span>
                </div>
                <h2 className="text-2xl font-medium text-stone-900 leading-tight">
                    {article.title}
                </h2>
            </div>

            {/* AI Stats */}
            {article.matchCount > 0 && (
                <div className="mb-6 p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-amber-900 font-medium">AI Smart Match</p>
                        <p className="text-xs text-amber-700/80">Specifically recommended for <strong>{article.matchCount} sessions</strong> based on keywords: {article.keywords?.join(', ')}.</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="prose prose-stone max-w-none prose-headings:font-medium prose-a:text-teal-600 mb-8">
                <p className="lead text-stone-600">{article.snippet}</p>
                <div dangerouslySetInnerHTML={{ __html: article.contentHTML || `<p>${article.content}</p>` }} />
            </div>

            {/* Related */}
            {article.related && article.related.length > 0 && (
                <div className="pt-6 border-t border-stone-100 mb-6">
                    <h4 className="text-sm font-medium text-stone-900 mb-3">Related Articles</h4>
                    <div className="space-y-2">
                        {article.related.map((rel, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                                <span className="text-sm text-stone-700">{rel}</span>
                                <ArrowRight className="w-4 h-4 text-stone-400" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto flex gap-3 pb-safe">
                <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl h-12 shadow-sm border-0">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Article
                </Button>
                <Button variant="outline" className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-12">
                    <Share2 className="w-4 h-4 mr-2" /> Send to Client
                </Button>
                <Button variant="ghost" className="h-12 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-4">
                    <Trash className="w-5 h-5" />
                </Button>
            </div>
        </V3Overlay>
    );
}
