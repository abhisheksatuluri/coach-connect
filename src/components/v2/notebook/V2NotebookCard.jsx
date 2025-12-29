import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, User, Calendar, Map, Link as LinkIcon, Paperclip } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function V2NotebookCard({ note, isSelected, onClick }) {
    const getIcon = () => {
        switch (note.category) {
            case 'My Notes': return <FileText className="w-3.5 h-3.5" />;
            case 'Client Notes': return <User className="w-3.5 h-3.5" />;
            case 'Session Notes': return <Calendar className="w-3.5 h-3.5" />;
            case 'Journey Notes': return <Map className="w-3.5 h-3.5" />;
            case 'Files': return <Paperclip className="w-3.5 h-3.5" />;
            default: return <FileText className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-amber-400 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {getIcon()}
                    </div>
                    <h3 className={cn("text-sm font-bold truncate max-w-[180px]", isSelected ? "text-white" : "text-slate-200")}>
                        {note.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{note.timestamp}</span>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "text-amber-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
                </div>
            </div>

            {/* Row 2: Snippet */}
            <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                {note.snippet}
            </p>

            {/* Row 3: Footer */}
            <div className="flex items-center gap-3 pt-2 text-[10px]">
                <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800/50 h-5 px-1.5 font-normal">
                    {note.category}
                </Badge>
                {note.linkedEntity && (
                    <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        <LinkIcon className="w-2.5 h-2.5" /> {note.linkedEntity}
                    </span>
                )}
            </div>
        </div>
    );
}
