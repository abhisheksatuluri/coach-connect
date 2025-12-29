import React, { useState } from 'react';
import {
    MoreHorizontal, Trash, Copy, Check, Calendar, Flag, Link as LinkIcon, CheckCircle, Plus, Sparkles, User, Map, CheckSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function V2TaskDetail({ task, onDelete }) {
    if (!task) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a task to view details
        </div>
    );

    const [status, setStatus] = useState(task.status || 'To Do');

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start gap-4">
                    <div
                        onClick={() => setStatus(status === 'Done' ? 'To Do' : 'Done')}
                        className={cn(
                            "w-6 h-6 rounded border flex items-center justify-center cursor-pointer mt-1 transition-colors",
                            status === 'Done' ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-500 hover:border-indigo-400"
                        )}>
                        {status === 'Done' && <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <Input
                            defaultValue={task.title}
                            className={cn(
                                "bg-transparent border-0 text-lg font-bold text-white px-0 h-auto focus:ring-0 placeholder:text-slate-600 rounded-none border-b border-transparent focus:border-slate-700 transition-colors",
                                status === 'Done' && "line-through text-slate-500"
                            )}
                            placeholder="Task Title"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        {task.isAI && (
                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px] px-1.5 py-0 mr-2">
                                <Sparkles className="w-3 h-3 mr-1" /> AI
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400">
                            <Trash className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 ml-10">
                    <Badge variant="outline" className={cn("border-slate-700 bg-slate-800 text-slate-300 gap-1 pl-1")}>
                        <Calendar className="w-3 h-3 text-slate-400" /> {task.dueDate || 'Set Date'}
                    </Badge>
                    <Badge variant="outline" className={cn("border-slate-700 bg-slate-800 text-slate-300 gap-1 pl-1 cursor-pointer hover:bg-slate-700")}>
                        <Flag className={cn("w-3 h-3",
                            task.priority === 'High' ? "text-rose-500" :
                                task.priority === 'Medium' ? "text-amber-500" : "text-green-500"
                        )} /> {task.priority || 'Medium'}
                    </Badge>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">

                    {/* 1. Description */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                        <textarea
                            className="w-full bg-slate-800/30 rounded border border-slate-800 p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                            placeholder="Add details..."
                            defaultValue={task.description}
                        />
                    </div>

                    {/* 2. Checklist / Subtasks */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist</h4>
                            <span className="text-xs text-slate-600">0/3</span>
                        </div>
                        <div className="space-y-2">
                            {['Review session notes', 'Send follow-up email', 'Prepare intake form'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-indigo-400 transition-colors flex items-center justify-center">
                                        {i === 0 && <Check className="w-3 h-3 text-indigo-400" />}
                                    </div>
                                    <span className={cn("text-sm text-slate-300", i === 0 && "text-slate-500 line-through")}>{item}</span>
                                </div>
                            ))}
                            <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-400 font-medium px-1 py-1">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>
                    </div>

                    {/* 3. Linked Items */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked To</h4>
                        <div className="space-y-2">
                            {(task.clientName || task.client) && (
                                <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {(task.clientName || task.client)?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-400">{task.clientName || task.client}</p>
                                        <p className="text-[10px] text-slate-500">Client Profile</p>
                                    </div>
                                    <LinkIcon className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                                </div>
                            )}

                            {(task.journeyName || task.journey) && (
                                <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-lg">
                                        <Map className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-200 group-hover:text-emerald-400">{task.journeyName || task.journey}</p>
                                        <p className="text-[10px] text-slate-500">Journey</p>
                                    </div>
                                    <LinkIcon className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
