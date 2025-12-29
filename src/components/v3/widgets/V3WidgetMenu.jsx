import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { createPortal } from 'react-dom';
import {
    Sparkles, Plus, Search, FileText, CheckSquare, X,
    MessageSquare, Brain, Paperclip
} from 'lucide-react';

export default function V3WidgetMenu({ isOpen, onClose, context = 'global', onAction }) {
    if (typeof document === 'undefined' || !isOpen) return null;

    // Context-aware options
    const getOptions = () => {
        const common = [
            { id: 'note', label: 'Add Quick Note', icon: FileText, desc: 'Save a thought' },
            { id: 'task', label: 'Create Task', icon: CheckSquare, desc: 'Set a reminder' },
            { id: 'search', label: 'Search Content', icon: Search, desc: 'Find anything' },
        ];

        if (context === 'session') {
            return [
                { id: 'ai_insight', label: 'AI Insights', icon: Brain, desc: 'Analyze conversation', color: 'text-purple-600 bg-purple-50' },
                { id: 'summary', label: 'Generate Summary', icon: Sparkles, desc: 'Summarize transcript', color: 'text-amber-600 bg-amber-50' },
                ...common
            ];
        }

        if (context === 'contact') {
            return [
                { id: 'session', label: 'Schedule Session', icon: MessageSquare, desc: 'Book time', color: 'text-teal-600 bg-teal-50' },
                ...common
            ];
        }

        return common;
    };

    const options = getOptions();

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[70] transition-opacity"
                onClick={onClose}
            />

            {/* Menu Sheet/Dropdown */}
            <div
                className={cn(
                    "fixed z-[71] bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-out",
                    // Mobile: Bottom Sheet
                    "bottom-0 left-0 right-0 rounded-t-2xl md:bottom-auto md:left-auto md:right-4 md:top-16 md:w-80 md:rounded-2xl border border-stone-100"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
                    <div className="flex items-center gap-2 text-stone-900 font-semibold">
                        <Sparkles className="w-4 h-4 text-teal-600" fill="currentColor" fillOpacity={0.2} />
                        <span>Quick Actions</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-200/50 text-stone-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Grid of Options */}
                <div className="p-2 space-y-1">
                    {options.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => { onAction(opt.id); onClose(); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group text-left"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    opt.color || "bg-stone-100 text-stone-500 group-hover:bg-teal-50 group-hover:text-teal-600"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-stone-900">{opt.label}</div>
                                    <div className="text-xs text-stone-500">{opt.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>,
        document.body
    );
}
