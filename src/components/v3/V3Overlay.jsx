import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3Overlay({ isOpen, onClose, title, children, className }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Content Card */}
            <div
                className={cn(
                    "relative w-full max-w-[600px] bg-white rounded-t-[20px] sm:rounded-[20px] shadow-2xl transition-all duration-300 ease-out transform flex flex-col max-h-[90vh]",
                    isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-full sm:translate-y-10 sm:scale-95 opacity-0",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
                    <h2 className="text-xl font-medium text-stone-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
