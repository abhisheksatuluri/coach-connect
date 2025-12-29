import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { CheckSquare, Calendar, Flag, Link as LinkIcon, Trash2, CheckCircle, Sparkles, User, Map, Plus } from 'lucide-react';

export default function V5TaskWindow({ task }) {
    if (!task) return (
        <div className="flex items-center justify-center h-full text-stone-400">
            Select a task to view details
        </div>
    );

    const [completed, setCompleted] = useState(task.status === 'completed' || task.status === 'Done');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-5 border-b border-stone-100">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => setCompleted(!completed)}
                        className={cn(
                            "w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-1 transition-colors",
                            completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "bg-white border-stone-300 hover:border-emerald-400"
                        )}
                    >
                        {completed && <CheckSquare className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                        <textarea
                            defaultValue={task.title}
                            className={cn(
                                "text-lg font-bold text-stone-900 w-full focus:outline-none bg-transparent resize-none h-auto overflow-hidden leading-tight",
                                completed && "line-through text-stone-400"
                            )}
                            rows={2}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            {task.isAI && (
                                <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-xs font-bold uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI Suggested
                                </div>
                            )}
                            <div className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase",
                                task.priority === 'High' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                    task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        "bg-stone-100 text-stone-500"
                            )}>
                                {task.priority || 'Normal'} Priority
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Due Date & Assignee Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Due Date</label>
                        <div className="flex items-center gap-2 text-sm text-stone-700 hover:bg-stone-50 p-2 rounded-lg -ml-2 transition-colors cursor-pointer group">
                            <Calendar className="w-4 h-4 text-stone-400 group-hover:text-emerald-500" />
                            {task.dueDate || 'Set due date'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Assignee</label>
                        <div className="flex items-center gap-2 text-sm text-stone-700 hover:bg-stone-50 p-2 rounded-lg -ml-2 transition-colors cursor-pointer group">
                            <User className="w-4 h-4 text-stone-400 group-hover:text-emerald-500" />
                            You
                        </div>
                    </div>
                </div>

                {/* Linked Content */}
                {(task.clientName || task.journeyName || task.client || task.journey) && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Linked To</label>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors">
                            <LinkIcon className="w-3 h-3" />
                            {task.clientName || task.client || task.journeyName || task.journey}
                        </div>
                    </div>
                )}

                {/* Checklist */}
                <div>
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Checklist</label>
                    <div className="space-y-2">
                        {['Review session notes', 'Send follow-up email'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg -ml-2 transition-colors cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-stone-300 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                                    {i === 0 && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                </div>
                                <span className={cn("text-sm text-stone-700", i === 0 && "text-stone-400 line-through")}>{item}</span>
                            </div>
                        ))}
                        <button className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-800 font-medium px-1 py-1 -ml-1">
                            <Plus className="w-3 h-3" /> Add Item
                        </button>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Notes</label>
                    <textarea
                        className="w-full min-h-[100px] p-3 rounded-xl border border-stone-200 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none resize-none leading-relaxed text-stone-600"
                        placeholder="Add details..."
                        defaultValue={task.description}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex justify-between items-center bg-stone-50/50">
                <button className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-xs text-stone-400">Created {task.createdDate || 'recently'}</div>
            </div>
        </div>
    );
}
