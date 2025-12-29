import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { cn } from "@/lib/utils";

const VERSIONS = [
    { id: 'v1', label: 'V1: Legacy', path: '/' },
    { id: 'v2', label: 'V2: Command', path: '/v2' },
    { id: 'v3', label: 'V3: Zen', path: '/v3' },
    { id: 'v4', label: 'V4: Feed', path: '/v4' },
    { id: 'v5', label: 'V5: Spatial', path: '/v5' },
];

export default function VersionSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentVersion = () => {
        const path = location.pathname;
        if (path.startsWith('/v2')) return 'V2';
        if (path.startsWith('/v3')) return 'V3';
        if (path.startsWith('/v4')) return 'V4';
        if (path.startsWith('/v5')) return 'V5';
        return 'V1';
    };

    const currentVer = getCurrentVersion();

    return (
        <div className="fixed bottom-4 left-4 z-[9999] font-sans">
            <div className="relative">
                {isOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="py-1">
                            {VERSIONS.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => {
                                        navigate(v.path);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                                        currentVer === v.label.split(':')[0]
                                            ? "text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/20"
                                            : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border transition-all duration-200",
                        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                        "hover:border-teal-500 dark:hover:border-teal-500",
                        "text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider"
                    )}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{currentVer}</span>
                </button>
            </div>
        </div>
    );
}
