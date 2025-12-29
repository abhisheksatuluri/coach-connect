import React from 'react';
import { cn } from "@/lib/utils";
import { Clock, Calendar, Activity, ChevronRight, Plus, Users, Book, CreditCard, Leaf } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import V2QuickTaskInput from './tasks/V2QuickTaskInput';

const QuickActionBtn = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center gap-2 p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors group">
        <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <Icon className="w-3 h-3" />
        </div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

export default function V2UtilityDock({ className, isOpen = true, onToggle }) {
    const location = useLocation();
    const path = location.pathname;

    if (!isOpen) {
        return (
            <div className={cn("w-4 bg-slate-800 border-l border-slate-700 h-screen fixed right-0 top-0 cursor-pointer hover:bg-slate-700 transition-colors flex items-center justify-center z-40", className)} onClick={onToggle}>
                <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
        );
    }

    const renderContextContent = () => {
        if (path.includes('Clients')) {
            return (
                <>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Client Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <QuickActionBtn icon={Users} label="New Client" />
                            <QuickActionBtn icon={Calendar} label="Schedule" />
                        </div>
                    </section>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recently Viewed</h3>
                        <div className="space-y-2">
                            {['Sarah Connor', 'Mike Ross'].map(name => (
                                <div key={name} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                                        {name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="text-xs text-slate-300">{name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            );
        }

        if (path.includes('Sessions')) {
            return (
                <>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Session Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <QuickActionBtn icon={Calendar} label="New Session" />
                            <QuickActionBtn icon={Clock} label="Availability" />
                        </div>
                    </section>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Up Next</h3>
                        <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="mt-1"><Clock className="w-4 h-4 text-indigo-400" /></div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-100">Session with Sarah</p>
                                    <p className="text-xs text-indigo-300 mt-1">Starts in 15 mins</p>
                                    <button className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors w-full">Join Room</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            );
        }

        if (path.includes('Payments')) {
            return (
                <>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Finance Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <QuickActionBtn icon={CreditCard} label="New Invoice" />
                            <QuickActionBtn icon={Activity} label="Reports" />
                        </div>
                    </section>
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overdue Alerts</h3>
                        <div className="p-3 bg-rose-900/10 border border-rose-500/20 rounded text-rose-200 text-xs">
                            <span className="font-bold">2 Invoices</span> are overdue by 7+ days.
                        </div>
                    </section>
                </>
            );
        }

        // Default / Dashboard
        return (
            <>
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <QuickActionBtn icon={Plus} label="New Task" />
                        <QuickActionBtn icon={Users} label="New Client" />
                        <QuickActionBtn icon={Calendar} label="New Session" />
                        <QuickActionBtn icon={Book} label="New Note" />
                    </div>
                </section>
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Today's Pulse</h3>
                    <div className="space-y-2">
                        <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">Sessions</span>
                                <span className="text-xs font-bold text-emerald-400">3/5</span>
                            </div>
                            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[60%]" />
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    };

    return (
        <div className={cn("w-[280px] bg-slate-900 border-l border-slate-700 h-screen fixed right-0 top-0 flex flex-col text-slate-300 z-40 transition-transform duration-300", className)}>
            {/* Header */}
            <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur">
                <span className="font-semibold text-sm text-slate-100">Utility Dock</span>
                <button onClick={onToggle} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Dynamic Context Section */}
                {renderContextContent()}

                {/* Universal Quick Task */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Capture</h3>
                    <V2QuickTaskInput />
                </section>

                {/* Global Recent Activity */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h3>
                    <div className="space-y-0 relative border-l border-slate-800 ml-1.5 pl-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="mb-4 relative">
                                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600" />
                                <p className="text-xs text-slate-300">
                                    <span className="font-semibold text-slate-100">Mike</span> completed task <span className="text-slate-400">"Review Intake"</span>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">2m ago</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
