import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createPortal } from 'react-dom';

export default function V3Slider({ isOpen, onClose, title, children, width = "default" }) {
    if (typeof document === 'undefined') return null;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Slider Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full bg-white z-[61] shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                    // Width Config
                    "w-[85%] md:w-[400px]",
                    // Shape
                    "rounded-l-2xl border-l border-stone-100",
                    // Transform
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="h-14 min-h-[56px] px-4 flex items-center justify-between border-b border-stone-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 rounded-tl-2xl">
                    <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
