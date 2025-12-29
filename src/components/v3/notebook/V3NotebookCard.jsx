import React from 'react';
import { FileText, Image, Paperclip, User, Map, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3NotebookCard({ note, onClick }) {
    const getIcon = () => {
        switch (note.type) {
            case 'file': return <Paperclip className="w-4 h-4" />;
            case 'image': return <Image className="w-4 h-4" />;
            case 'client': return <User className="w-4 h-4" />;
            case 'session': return <Calendar className="w-4 h-4" />;
            case 'journey': return <Map className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getCategoryColor = () => {
        switch (note.category) {
            case 'Client': return 'bg-teal-500';
            case 'Session': return 'bg-indigo-500';
            case 'Journey': return 'bg-amber-500';
            default: return 'bg-stone-300';
        }
    };

    return (
        <div
            onClick={onClick}
            className="group flex items-center h-[72px] px-4 cursor-pointer bg-white rounded-xl border border-stone-100 hover:border-tea-200 hover:shadow-sm hover:bg-stone-50 transition-all relative overflow-hidden mb-2"
        >
            {/* Category Indicator */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", getCategoryColor())} />

            {/* Left: Icon */}
            <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:text-teal-600 transition-colors">
                    {getIcon()}
                </div>
            </div>

            {/* Middle: Content */}
            <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-sm font-medium text-stone-900 truncate group-hover:text-teal-900 transition-colors mb-0.5">
                    {note.title}
                </h3>
                <p className="text-xs text-stone-500 truncate">
                    {note.snippet}
                </p>
            </div>

            {/* Right: Timestamp */}
            <div className="flex-shrink-0">
                <span className="text-xs text-stone-400 font-medium">
                    {note.timestamp}
                </span>
            </div>
        </div>
    );
}
