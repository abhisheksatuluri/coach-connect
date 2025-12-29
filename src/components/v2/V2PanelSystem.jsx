import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Loader2 } from 'lucide-react';

export default function V2PanelSystem({
    primaryContent,
    secondaryContent,
    isSplit = false,
    onToggleSplit
}) {
    const [isMaximised, setIsMaximised] = useState(false);
    const [splitRatio, setSplitRatio] = useState(50); // percentage for primary

    return (
        <div className="h-full flex flex-row overflow-hidden bg-slate-900 relative">
            {/* Primary Panel */}
            <div
                className={cn(
                    "flex flex-col bg-slate-900 transition-all duration-300 ease-in-out border-r border-slate-800 relative",
                    isMaximised ? "w-full" : (isSplit ? `w-[${splitRatio}%]` : "w-full") // Simplified for now, real split drag needs more logic
                )}
                style={{ width: isSplit && !isMaximised ? `${splitRatio}%` : '100%' }}
            >
                <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-100">Workspace</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {secondaryContent && (
                            <button
                                onClick={onToggleSplit}
                                className={cn(
                                    "p-1.5 rounded transition-colors",
                                    isSplit ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                                title="Toggle Split View"
                            >
                                <div className="w-4 h-4 border-2 border-current rounded-sm flex">
                                    <div className="w-1/2 border-r border-current h-full" />
                                </div>
                            </button>
                        )}
                        <button
                            onClick={() => setIsMaximised(!isMaximised)}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            {isMaximised ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-900/50 p-6">
                    {primaryContent}
                </div>
            </div>

            {/* Splitter Handle (Visual only for now) */}
            {isSplit && !isMaximised && (
                <div className="w-1 bg-slate-800 hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors" />
            )}

            {/* Secondary Panel */}
            {isSplit && !isMaximised && secondaryContent && (
                <div className="flex-1 flex flex-col bg-slate-800/50 min-w-[300px]">
                    <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-800 flex-shrink-0">
                        <span className="text-sm font-medium text-slate-300">Details</span>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {secondaryContent}
                    </div>
                </div>
            )}
        </div>
    );
}
