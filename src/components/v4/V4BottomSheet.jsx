import React, { useEffect, useState } from 'react';
import { X, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4BottomSheet({ isOpen, onClose, children, title, className }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            setIsExpanded(false); // Reset expansion on close
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-end pointer-events-none">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "relative w-full max-w-[600px] bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out transform pointer-events-auto flex flex-col",
                    isOpen ? "translate-y-0" : "translate-y-full",
                    isExpanded ? "h-[90vh]" : "h-[60vh]",
                    className
                )}
            >
                {/* Drag Handle Area */}
                <div
                    className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-stone-100 flex-shrink-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-12 h-1.5 rounded-full bg-stone-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                    {children}
                </div>
            </div>
        </div>
    );
}
