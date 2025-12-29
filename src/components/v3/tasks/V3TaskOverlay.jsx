import React, { useState } from 'react';
import { Calendar, User, Map, Link as LinkIcon, Trash, Flag, CheckSquare, Plus, CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

export default function V3TaskOverlay({ task, isOpen, onClose }) {
    if (!task) return null;

    const [status, setStatus] = useState(task.status || 'To Do');
    const [priority, setPriority] = useState(task.priority || 'Medium');

    const statusOptions = ['To Do', 'In Progress', 'Done'];
    const priorityOptions = ['Low', 'Medium', 'High'];

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Task Details">
            {/* Header / Title */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    {task.isAI && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> AI Suggested
                        </div>
                    )}
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                        status === 'Done' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                "bg-stone-50 text-stone-600 border-stone-200"
                    )}>
                        {status}
                    </span>
                </div>
                <input
                    defaultValue={task.title}
                    className="w-full text-xl font-semibold text-stone-900 bg-transparent border-none outline-none placeholder:text-stone-400 p-0"
                    placeholder="Task title"
                />
            </div>

            <div className="space-y-6 pb-24">
                {/* Section 1: Core Meta */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Due Date</label>
                        <div className="flex items-center gap-2 text-stone-700 font-medium text-sm">
                            <Calendar className="w-4 h-4 text-stone-400" />
                            {task.dueDate || 'Set date'}
                        </div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Priority</label>
                        <div className="flex items-center gap-1">
                            {priorityOptions.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        "w-2 h-8 rounded-full transition-all",
                                        priority === p && p === 'High' ? "bg-rose-500 ring-2 ring-rose-200" :
                                            priority === p && p === 'Medium' ? "bg-amber-500 ring-2 ring-amber-200" :
                                                priority === p && p === 'Low' ? "bg-green-500 ring-2 ring-green-200" :
                                                    "bg-stone-200 hover:bg-stone-300"
                                    )}
                                    title={p}
                                />
                            ))}
                            <span className="ml-2 text-sm font-medium text-stone-700">{priority}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Linked To */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Related To</label>
                    {task.client && (
                        <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl hover:border-teal-300 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                    {task.client?.charAt(0) || 'C'}
                                </div>
                                <div className="text-sm font-medium text-stone-900 group-hover:text-teal-700 transition-colors">{task.client}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-teal-400" />
                        </div>
                    )}
                    {task.journey && (
                        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <Map className="w-4 h-4 text-stone-400" />
                            <div>
                                <div className="text-[10px] text-stone-400 uppercase font-bold">Journey</div>
                                <div className="text-sm font-medium text-stone-700">{task.journey}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Subtasks / Checklist */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Checklist</label>
                        <span className="text-xs text-stone-400">0/3</span>
                    </div>
                    <div className="space-y-2">
                        {['Review session notes', 'Send follow-up email', 'Prepare intake form'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-stone-300 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                                    {i === 0 && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                                </div>
                                <span className={cn("text-sm text-stone-700 font-medium", i === 0 && "text-stone-400 line-through")}>{item}</span>
                            </div>
                        ))}
                        <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 font-medium px-1 py-2">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                </div>

                {/* Section 4: Notes */}
                <div>
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Description</label>
                    <textarea
                        className="w-full min-h-[120px] p-4 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:border-teal-500 focus:ring-0 outline-none resize-none leading-relaxed text-stone-700"
                        placeholder="Add more details about this task..."
                        defaultValue={task.description}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-50">
                <Button
                    className={cn("flex-1 h-12 rounded-xl shadow-lg border-0 gap-2 font-medium tracking-wide text-white transition-all",
                        status === 'Done' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-stone-900 hover:bg-black"
                    )}
                    onClick={() => setStatus(status === 'Done' ? 'To Do' : 'Done')}
                >
                    {status === 'Done' ? <><CheckCircle className="w-4 h-4" /> Completed</> : "Mark Complete"}
                </Button>
                <Button variant="outline" className="h-12 w-12 border-stone-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl p-0 flex items-center justify-center">
                    <Trash className="w-5 h-5" />
                </Button>
            </div>
        </V3Overlay>
    );
}
