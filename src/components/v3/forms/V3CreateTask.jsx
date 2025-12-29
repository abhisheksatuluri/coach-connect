
import React, { useState } from 'react';
import { ArrowLeft, Link as LinkIcon, Calendar, Flag } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function V3CreateTask({ context = { name: 'James Cooper', type: 'Client' } }) {
    const { popScreen } = useStackNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState(new Date()); // Default today
    const [isSaving, setIsSaving] = useState(false);

    const priorities = [
        { label: 'Low', color: 'bg-stone-100 text-stone-600 hover:bg-stone-200', active: 'bg-stone-600 text-white' },
        { label: 'Medium', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', active: 'bg-orange-500 text-white' },
        { label: 'High', color: 'bg-red-50 text-red-600 hover:bg-red-100', active: 'bg-red-500 text-white' }
    ];

    const handleSave = () => {
        if (!title.trim()) return;

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Task created successfully");
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
                    <h1 className="text-lg font-semibold text-stone-900">Create Task</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!title.trim() || isSaving}
                    className="px-4 py-1.5 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">

                {/* Context */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg w-fit text-xs font-medium text-stone-600">
                    <LinkIcon className="w-3 h-3" />
                    <span>Linked to {context.name}</span>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Task Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Follow up on session"
                        className="w-full text-xl md:text-2xl font-semibold bg-transparent border-none p-0 focus:ring-0 placeholder:text-stone-300"
                        autoFocus
                    />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Due Date</label>
                        <button className="flex items-center gap-3 w-full p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-left group">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-stone-900">
                                {format(dueDate, 'MMM d, yyyy')}
                            </span>
                        </button>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Priority</label>
                        <div className="flex gap-2">
                            {priorities.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setPriority(p.label)}
                                    className={cn(
                                        "flex-1 py-3 px-2 rounded-xl text-sm font-medium transition-all border border-transparent",
                                        priority === p.label ? p.active + " shadow-md" : p.color
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 flex-1">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add more details..."
                        className="w-full min-h-[150px] resize-none bg-transparent border-none p-0 focus:ring-0 text-base leading-relaxed placeholder:text-stone-300"
                    />
                </div>

            </div>
        </div>
    );
}
