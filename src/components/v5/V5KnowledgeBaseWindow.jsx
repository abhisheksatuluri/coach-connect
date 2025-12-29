import React from 'react';
import { cn } from "@/lib/utils";
import { Book, Share2, Sparkles, FolderOpen, Edit3 } from 'lucide-react';

export default function V5KnowledgeBaseWindow({ data }) {
    const article = data || { title: 'Article', content: '' };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 bg-indigo-50/30 border-b border-indigo-100/50">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Book className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="px-2 py-0.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wide w-fit mb-0.5">
                            {article.category || 'Resource'}
                        </div>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-tight">{article.title}</h2>
            </div>

            {/* Content with Sidebar Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Article */}
                <div className="flex-1 overflow-y-auto p-6 border-r border-stone-100">
                    <div className="prose prose-sm max-w-none text-stone-700">
                        {article.content ? (
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                            <>
                                <p>Cognitive Reframing is a psychological technique that consists of identifying and then disputing irrational or maladaptive thoughts.</p>
                                <h4>Key Steps:</h4>
                                <ul>
                                    <li>Identify the negative thought</li>
                                    <li>Evaluate the evidence</li>
                                    <li>Generate an alternative perspective</li>
                                </ul>
                                <p>This technique is essential for clients dealing with anxiety...</p>
                            </>
                        )}
                    </div>
                </div>

                {/* AI / Meta Sidebar */}
                <div className="w-48 bg-stone-50 p-4 overflow-y-auto shrink-0 flex flex-col gap-6">
                    {/* Matching */}
                    <div>
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Insights
                        </h4>
                        <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-sm text-xs">
                            <div className="text-stone-500 mb-1">Matched keywords:</div>
                            <div className="flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">anxiety</span>
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">CBT</span>
                            </div>
                        </div>
                    </div>

                    {/* Usage */}
                    <div>
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Used In</h4>
                        <ul className="space-y-2">
                            <li className="text-xs p-2 bg-white border border-stone-200 rounded hover:border-indigo-300 cursor-pointer transition-colors">
                                <div className="font-semibold text-stone-800">Intake Session</div>
                                <div className="text-stone-500 text-[10px]">Sarah Connor</div>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                            <Share2 className="w-3 h-3" />
                            Share
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-medium transition-colors">
                            <Edit3 className="w-3 h-3" />
                            Edit Article
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
