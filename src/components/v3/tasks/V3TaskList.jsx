
import React, { useState } from 'react';
import { CheckSquare, Calendar, Flag, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { tasksData, contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3TaskDetail from './V3TaskDetail';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export default function V3TaskList() {
    const { pushScreen } = useStackNavigation();
    const [filter, setFilter] = useState('My Tasks'); // My Tasks, Delegated, Completed

    const filtered = tasksData.filter(t => {
        if (filter === 'Completed') return t.completed;
        if (filter === 'Delegated') return false; // Mock no delegated tasks for now
        return !t.completed;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const getDueLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isPast(date)) return 'Overdue';
        return format(date, 'MMM d');
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 space-y-4 bg-stone-50/50 sticky top-0 z-10 border-b border-stone-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">Tasks</h2>
                    <button className="text-sm font-medium text-teal-600">New Task</button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['My Tasks', 'Delegated', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                                filter === f
                                    ? "bg-stone-900 text-white border-stone-900"
                                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filtered.map((t, i) => {
                    const contact = contactsData.find(c => c.id === t.contactId);
                    const date = new Date(t.dueDate);
                    const dueLabel = getDueLabel(date);

                    return (
                        <div
                            key={t.id}
                            onClick={() => pushScreen(V3TaskDetail, { task: t })}
                            className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-teal-500 transition-all cursor-pointer group"
                        >
                            <div className={cn("mt-1 w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center",
                                t.completed ? "bg-teal-500 border-teal-500" : "border-stone-300 group-hover:border-teal-500"
                            )}>
                                {t.completed && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={cn("font-semibold text-base truncate", t.completed ? "text-stone-400 line-through" : "text-stone-900")}>
                                    {t.title}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-500">
                                    <span className={cn("flex items-center gap-1 font-medium",
                                        dueLabel === 'Overdue' ? "text-rose-500" :
                                            dueLabel === 'Today' ? "text-amber-600" : "text-stone-500"
                                    )}>
                                        <Calendar className="w-3 h-3" /> {dueLabel}
                                    </span>
                                    {contact && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {contact.name}</span>}
                                    {t.priority === 'High' && !t.completed && (
                                        <span className="text-rose-500 flex items-center gap-1 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                            <Flag className="w-3 h-3" /> High
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
