import React, { useState } from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { CheckSquare, Calendar, Flag, User, Paperclip, Trash2, CheckCircle, Plus, Link as LinkIcon, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4TaskSheet({ task, isOpen, onClose }) {
    if (!task) return null;

    const [status, setStatus] = useState(task.status || 'To Do');

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title=""
        >
            <div className="space-y-6 pb-20">
                {/* Header Task Title */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setStatus(status === 'Done' ? 'To Do' : 'Done')}
                        className={cn("w-6 h-6 mt-1 rounded border-2 shrink-0 transition-colors flex items-center justify-center",
                            status === 'Done' ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300 hover:border-emerald-500 hover:bg-emerald-50"
                        )}
                    >
                        {status === 'Done' && <CheckCircle className="w-4 h-4" />}
                    </button>
                    <div>
                        <h2 className={cn("text-xl font-bold text-stone-900 leading-snug", status === 'Done' && "line-through text-stone-400")}>
                            {task.title || "Review intake forms"}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            {task.isAI && (
                                <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-xs font-bold uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> AI
                                </div>
                            )}
                            <div className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase",
                                task.priority === 'High' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                    task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        "bg-stone-100 text-stone-500"
                            )}>
                                {task.priority || 'Normal'} Priority
                            </div>
                            <div className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-xs font-medium">
                                Due {task.dueDate || 'Soon'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Inputs */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-stone-100">
                        <Calendar className="w-5 h-5 text-stone-400" />
                        <span className="flex-1 text-sm text-stone-700 font-medium">Due Date</span>
                        <span className="text-sm text-stone-900">{task.dueDate || 'Set date'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-stone-100">
                        <Flag className="w-5 h-5 text-stone-400" />
                        <span className="flex-1 text-sm text-stone-700 font-medium">Priority</span>
                        <span className={cn("text-sm font-medium",
                            task.priority === 'High' ? "text-rose-500" :
                                task.priority === 'Medium' ? "text-amber-500" : "text-stone-500"
                        )}>{task.priority || 'Normal'}</span>
                    </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Checklist */}
                <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Checklist</h4>
                    <div className="space-y-2">
                        {['Review session notes', 'Send follow-up email'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-stone-300 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                                    {i === 0 && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                </div>
                                <span className={cn("text-sm text-stone-700 font-medium", i === 0 && "text-stone-400 line-through")}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Notes</h4>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-sm leading-relaxed placeholder:text-stone-300 focus:ring-0 focus:border-stone-200 outline-none resize-none"
                        placeholder="Add notes, details, or subtasks here..."
                        defaultValue={task.description}
                    />
                </div>

                {/* Linked Content */}
                {(task.clientName || task.journeyName || task.client || task.journey) && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 group cursor-pointer hover:border-emerald-200 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                            {(task.clientName || task.client)?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs text-stone-500">Linked to</div>
                            <div className="text-sm font-medium text-stone-900 truncate">{task.clientName || task.client || task.journeyName || task.journey}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500" />
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                    <button className="p-2 text-stone-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        <button className="px-6 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-medium text-sm shadow-sm transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </V4BottomSheet>
    );
}
