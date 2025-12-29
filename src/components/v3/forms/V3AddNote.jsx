
import React, { useState } from 'react';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function V3AddNote({ context = { name: 'Sarah Mitchell', type: 'Client' } }) {
    const { popScreen } = useStackNavigation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Session');
    const [isSaving, setIsSaving] = useState(false);

    const categories = ['Personal', 'Session', 'Progress', 'General'];

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;

        setIsSaving(true);
        // Simulate network request
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Note saved successfully");
            popScreen();
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={popScreen}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-stone-900">Add Note</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!title.trim() || !content.trim() || isSaving}
                    className="px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Content SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Context Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg w-fit text-xs font-medium text-stone-600">
                    <LinkIcon className="w-3 h-3" />
                    <span>Linked to {context.name}</span>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Session observations"
                        className="w-full text-xl md:text-2xl font-semibold bg-transparent border-none p-0 focus:ring-0 placeholder:text-stone-300"
                        autoFocus
                    />
                </div>

                {/* Category Pills */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                    category === cat
                                        ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                                        : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Text Area */}
                <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Note Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing your note..."
                        className="w-full h-full min-h-[300px] resize-none bg-transparent border-none p-0 focus:ring-0 text-base leading-relaxed placeholder:text-stone-300"
                    />
                </div>
            </div>
        </div>
    );
}
