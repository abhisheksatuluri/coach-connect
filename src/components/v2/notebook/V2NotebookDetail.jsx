import React, { useState } from 'react';
import {
    MoreHorizontal, Edit, Trash, Share2, Pin, Calendar, User, Link as LinkIcon, Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function V2NotebookDetail({ note }) {
    if (!note) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a note to view details
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <Input
                            value={note.title}
                            className="bg-transparent border-0 text-xl font-bold text-white px-0 h-auto focus:ring-0 placeholder:text-slate-600 rounded-none border-b border-transparent focus:border-slate-700 transition-colors"
                            readOnly
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                                {note.category}
                            </Badge>
                            {note.linkedEntity && (
                                <span className="text-xs text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline">
                                    <LinkIcon className="w-3 h-3" /> {note.linkedEntity}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Pin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400">
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">

                    {/* Content Area - Simulated Editor */}
                    <div className="min-h-[300px] text-sm text-slate-300 leading-relaxed space-y-4">
                        {/* This would be the rich text editor output */}
                        <p>{note.content}</p>
                        {note.contentLong && note.contentLong.map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}

                        {/* Attachments Placeholder */}
                        {note.category === 'Files' && (
                            <div className="mt-8 p-4 border border-dashed border-slate-700 rounded bg-slate-800/30 flex items-center justify-center flex-col gap-2">
                                <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400">PDF</span>
                                </div>
                                <span className="text-sm text-slate-400 font-medium">intake-form.pdf</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-slate-600 text-slate-300">Download</Button>
                            </div>
                        )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-12 pt-6 border-t border-slate-800/50 space-y-3">
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Created {note.created}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Updated {note.timestamp}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-slate-600" />
                            {note.tags && note.tags.map(tag => (
                                <span key={tag} className="text-xs text-slate-400 hover:text-white cursor-pointer bg-slate-800 px-1.5 py-0.5 rounded transition-colors">
                                    #{tag}
                                </span>
                            ))}
                            <button className="text-xs text-slate-600 hover:text-indigo-400 px-1.5 border border-dashed border-slate-700 rounded transition-colors">+ Add Tag</button>
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
