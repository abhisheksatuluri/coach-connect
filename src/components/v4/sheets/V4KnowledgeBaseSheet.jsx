import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { LayoutGrid, Sparkles, Share2, Eye, Tag, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4KnowledgeBaseSheet({ article, isOpen, onClose }) {
    if (!article) return null;

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Knowledge Base Article"
        >
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                            {article.category || 'Reference'}
                        </span>
                        <span className="text-stone-300 text-xs">•</span>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                            <Eye className="w-3 h-3" />
                            Used 12 times
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 leading-tight">
                        {article.title}
                    </h2>
                </div>

                {/* AI Match Context (if applicable) */}
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Why this matched</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Anxiety', 'Sleep Patterns', 'Meditation'].map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded-md border border-indigo-100 text-xs font-medium text-indigo-600 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-stone prose-sm max-w-none">
                    <p className="text-stone-700 leading-relaxed">
                        {article.preview || "Full content would appear here."} It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                    </p>
                    <h4 className="text-stone-900 font-bold mt-6 mb-2">Key Principles</h4>
                    <ul className="list-disc list-outside ml-4 space-y-2 text-stone-700">
                        <li>Consistent sleep schedule is paramount.</li>
                        <li>Avoid blue light 1 hour before bed.</li>
                        <li>Practice 4-7-8 breathing technique.</li>
                    </ul>
                </div>

                <div className="h-px bg-stone-100 my-6" />

                {/* Recent Matches */}
                <div>
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Recent Use</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                    SM
                                </div>
                                <div className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Sarah Mitchell</div>
                            </div>
                            <span className="text-xs text-stone-400">Yesterday</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Share with Client
                    </button>
                    <button className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-medium transition-colors">
                        Edit Article
                    </button>
                </div>
            </div>
        </V4BottomSheet>
    );
}
