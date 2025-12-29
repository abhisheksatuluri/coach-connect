
import React from 'react';
import { ArrowLeft, Calendar, Flag, CheckSquare, User, Clock, CheckCircle2 } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { contactsData } from '@/data/v3DummyData';

export default function V3TaskDetail({ task }) {
    const { popScreen } = useStackNavigation();

    // Resolve contact name
    const contact = contactsData.find(c => c.id === task.contactId);

    const isCompleted = task.completed; // Dummy data uses boolean 'completed' or status 'Completed'? Check dummy data. 
    // v3DummyData: { completed: false, ... }

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
                    <div className="font-semibold text-stone-900">Task Details</div>
                </div>
                <button className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2",
                    isCompleted ? "bg-green-100 text-green-700" : "bg-stone-900 text-white hover:bg-stone-700"
                )}>
                    {isCompleted ? (
                        <>
                            <CheckCircle2 className="w-3 h-3" /> Completed
                        </>
                    ) : (
                        "Mark Complete"
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Main Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6">
                    <div>
                        <input
                            type="text"
                            defaultValue={task.title}
                            className="w-full text-2xl font-bold text-stone-900 border-none p-0 focus:ring-0 placeholder:text-stone-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-500">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase">Due Date</div>
                                <div className="font-semibold text-stone-900">{format(new Date(task.dueDate), 'MMM do, yyyy')}</div>
                            </div>
                        </div>

                        <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl shadow-sm flex items-center justify-center",
                                task.priority === 'High' ? "bg-rose-50 text-rose-500" :
                                    task.priority === 'Medium' ? "bg-amber-50 text-amber-500" : "bg-white text-stone-500"
                            )}>
                                <Flag className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-stone-400 uppercase">Priority</div>
                                <div className="font-semibold text-stone-900">{task.priority}</div>
                            </div>
                        </div>

                        {contact && (
                            <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3 md:col-span-2">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-stone-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-stone-400 uppercase">Related To</div>
                                    <div className="font-semibold text-stone-900">{contact.name}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase ml-1">Notes</label>
                        <textarea
                            className="w-full min-h-[150px] p-4 bg-stone-50 rounded-2xl border-none focus:ring-1 focus:ring-teal-500 text-stone-700 resize-none"
                            placeholder="Add details..."
                            defaultValue="Review client progress from last week and check in on nutrition adherence."
                        />
                    </div>
                </div>

                <div className="h-12" />
            </div>
        </div>
    );
}
