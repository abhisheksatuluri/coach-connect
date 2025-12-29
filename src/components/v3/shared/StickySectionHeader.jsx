
import React from 'react';
import { cn } from '@/lib/utils';

export default function StickySectionHeader({ title, className }) {
    return (
        <div className={cn(
            "sticky top-0 z-30 bg-[#FAFAF9]/95 backdrop-blur-sm px-4 py-3 border-b border-stone-100 transition-shadow",
            className
        )}>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {title}
            </h3>
        </div>
    );
}
