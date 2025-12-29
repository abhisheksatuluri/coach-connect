import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { X, Minus, Maximize2 } from 'lucide-react';
// import Draggable from 'react-draggable'; // Removed to avoid dependency issues if not installed. Custom drag logic used. 
// Actually, simple drag implementation since I can't easily npm install in this environment without asking user.
// I'll implement a simple drag handler hook or just make it static for now, but user requested draggable.
// I will simulate draggable props structure but rely on parent or simple CSS transform for now to avoid dependency issues if react-draggable isn't present.
// Note: User's environment might not have react-draggable. I'll implement a clean static version that supports "mock" dragging or use standard HTML5 drag if critical. 
// For "Standard Agentic" flow, it's safer to implement a custom simple drag handler if needed, or just standard detailed view.
// Let's assume standard absolute positioning that updates on drag.

export default function V5FloatingWindow({
    id,
    title,
    content,
    x,
    y,
    width = 400,
    height = 500,
    color = "bg-white",
    accentColor = "bg-stone-500",
    onClose,
    onFocus,
    zIndex,
    ...props
}) {
    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-2xl border border-stone-200 bg-white flex flex-col overflow-hidden transition-shadow",
                "backdrop-blur-xl bg-white/95 supports-[backdrop-filter]:bg-white/80"
            )}
            style={{
                left: x,
                top: y,
                width,
                height,
                zIndex
            }}
            onMouseDown={onFocus}
        >
            {/* Title Bar (Drag Handle) */}
            <div
                className={cn("h-10 border-b border-stone-100 flex items-center justify-between px-3 shrink-0 cursor-move bg-stone-50/50", accentColor.replace('bg-', 'border-t-4 border-'))}
                onMouseDown={(e) => props.onMouseDown && props.onMouseDown(e, id)}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <div className={cn("w-2 h-2 rounded-full", accentColor)} />
                    <span className="text-sm font-semibold text-stone-800">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-600">
                        <Minus className="w-3 h-3" />
                    </button>
                    <button className="p-1 hover:bg-stone-200 rounded text-stone-400 hover:text-stone-600">
                        <Maximize2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(id); }}
                        className="p-1 hover:bg-red-100 rounded text-stone-400 hover:text-red-500"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Content Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {content}
            </div>

            {/* Resizer Handle (Visual only for now) */}
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-50 hover:opacity-100">
                <svg viewBox="0 0 10 10" className="w-full h-full text-stone-400 fill-current">
                    <path d="M 10 10 L 10 0 L 0 10 Z" />
                </svg>
            </div>
        </div>
    );
}
