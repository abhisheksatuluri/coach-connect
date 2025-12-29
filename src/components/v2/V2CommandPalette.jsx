import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, User, Calendar, Map, CheckSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function V2CommandPalette({ open, onOpenChange }) {
    const [search, setSearch] = useState("");

    // Mock results
    const results = [
        { type: 'Client', title: 'Sarah Connor', icon: User, sub: 'Active • 2 days ago' },
        { type: 'Client', title: 'Mike Ross', icon: User, sub: 'Active • 1 week ago' },
        { type: 'Session', title: 'Weekly Check-in', icon: Calendar, sub: 'Tomorrow, 2:00 PM' },
        { type: 'Journey', title: '12-Week Transformation', icon: Map, sub: '8 Clients Enrolled' },
        { type: 'Task', title: 'Review Intake Form', icon: CheckSquare, sub: 'Due Today' },
    ].filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 bg-slate-900 border-slate-700 text-slate-200 max-w-2xl overflow-hidden shadow-2xl">
                {/* Input */}
                <div className="flex items-center px-4 py-3 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500 mr-3" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-0 text-lg placeholder:text-slate-600 focus:outline-none"
                        autoFocus
                    />
                    <span className="text-xs font-mono text-slate-600 border border-slate-800 rounded px-1.5 py-0.5">ESC</span>
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                    <h4 className="text-xs font-bold text-slate-600 px-2 py-1 mb-1">Suggested</h4>
                    {results.length > 0 ? results.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer group transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-slate-600">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-200 group-hover:text-white">{item.title}</div>
                                    <div className="text-xs text-slate-500">{item.sub}</div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-500 text-sm">No results found for "{search}"</div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span><strong className="text-slate-400">↑↓</strong> to navigate</span>
                        <span><strong className="text-slate-400">Enter</strong> to select</span>
                    </div>
                    <div>
                        Search powered by MindsAI
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
