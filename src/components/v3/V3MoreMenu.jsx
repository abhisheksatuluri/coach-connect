import React from 'react';
import { cn } from "@/lib/utils";
import { createPortal } from 'react-dom';
import {
    CheckSquare, CreditCard, Book, FileText, Settings, X, ChevronRight
} from 'lucide-react';

export default function V3MoreMenu({ isOpen, onClose, onNavigate }) {
    if (typeof document === 'undefined') return null;

    const items = [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-amber-500' },
        { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-emerald-500' },
        { id: 'notebook', label: 'Notebook', icon: Book, color: 'text-blue-500' },
        { id: 'knowledge-base', label: 'Knowledge Base', icon: FileText, color: 'text-indigo-500' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-stone-500' },
    ];

    return createPortal(
        <>
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[80] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />
            <div
                className={cn(
                    "fixed inset-x-0 bottom-0 z-[81] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] md:rounded-2xl",
                    isOpen ? "translate-y-0 md:-translate-y-1/2" : "translate-y-full md:translate-y-full"
                )}
            >
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">Apps & Tools</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onNavigate(item.id); onClose(); }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors group"
                            >
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-stone-50 group-hover:bg-white border border-stone-100 group-hover:shadow-sm transition-all")}>
                                    <Icon className={cn("w-5 h-5", item.color)} />
                                </div>
                                <span className="flex-1 text-left font-medium text-stone-900 text-base">{item.label}</span>
                                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </>,
        document.body
    );
}
