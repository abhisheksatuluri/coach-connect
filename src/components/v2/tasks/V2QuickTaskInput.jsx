import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V2QuickTaskInput({ className, onAdd }) {
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value.trim()) return;

        setIsLoading(true);
        // Mock API delay
        setTimeout(() => {
            setIsLoading(false);
            setValue('');
            if (onAdd) onAdd(value);
        }, 600);
    };

    return (
        <form onSubmit={handleSubmit} className={cn("relative", className)}>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Add a task... (e.g. Call Sarah tomorrow)"
                className="w-full bg-slate-800 border-0 rounded-lg py-3 pl-3 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow shadow-sm"
            />
            <button
                type="submit"
                disabled={!value || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
        </form>
    );
}
