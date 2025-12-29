import React from 'react';
import {
    MoreHorizontal, Edit, Trash, Share2, Copy, FileText, Zap, BarChart2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SectionHeader = ({ title, icon: Icon }) => (
    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 first:mt-0">
        {Icon && <Icon className="w-3.5 h-3.5" />} {title}
    </h4>
);

export default function V2KnowledgeBaseDetail({ article }) {
    if (!article) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select an article to view details
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20">
                            {article.category}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">

                    {/* 1. Content */}
                    <SectionHeader title="Article Content" icon={FileText} />
                    <div className="text-sm text-slate-300 leading-relaxed bg-slate-800/10 p-4 rounded border border-slate-800/50">
                        <p className="mb-4">{article.content}</p>
                        {article.contentLong && (
                            <div className="space-y-3">
                                {article.contentLong.map((section, i) => (
                                    <div key={i}>
                                        <h5 className="font-bold text-slate-200 mb-1">{section.header}</h5>
                                        <p>{section.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. AI Matching Info */}
                    <SectionHeader title="AI Trigger Logic" icon={Zap} />
                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-3">
                        <p className="text-xs text-indigo-200 mb-2">This article is automatically suggested when session transcripts contain:</p>
                        <div className="flex flex-wrap gap-2">
                            {article.keywords.map(kw => (
                                <span key={kw} className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/30">
                                    "{kw}"
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 3. Usage Stats */}
                    <SectionHeader title="Usage Statistics" icon={BarChart2} />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-slate-800/30 p-2 rounded border border-slate-700/50">
                            <div className="text-lg font-bold text-white">{article.useCount}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Total Opens</div>
                        </div>
                        <div className="bg-slate-800/30 p-2 rounded border border-slate-700/50">
                            <div className="text-lg font-bold text-white">{article.matchCount}</div>
                            <div className="text-[10px] text-slate-500 uppercase">AI Recommendations</div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 mb-1">Recent Matches:</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-800/20 rounded hover:bg-slate-800/40 cursor-pointer">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Session with <strong>Sarah Connor</strong> (Yesterday)
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-800/20 rounded hover:bg-slate-800/40 cursor-pointer">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Session with <strong>Mike Ross</strong> (Dec 20)
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
