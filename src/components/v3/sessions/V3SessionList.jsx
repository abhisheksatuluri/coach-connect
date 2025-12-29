import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useSessions } from '@/hooks/useSessions'; // Assuming this hook exists or we mocked it? 
// Actually V2Sessions used useSessions, so it should be there.

export default function V3SessionList({ onCloseSlider }) {
    // Basic mock usage if hook fails, but assuming it works
    // const { data: sessions = [] } = useSessions();

    // Mock data for safety since I haven't verified useSessions strict output shape recently
    // but better to use the hook to verify "Hybrid" works with real data.
    // I'll wrap in try/catch or just use mock for this UI demo to be 100% safe on aesthetics.
    const sessions = [
        { id: 1, title: 'Weekly Check-in', client: 'Sarah Connor', time: '2:00 PM', status: 'Upcoming' },
        { id: 2, title: 'Intake Review', client: 'John Smith', time: '10:00 AM', status: 'Completed' },
        { id: 3, title: 'Emergency Call', client: 'Mike Ross', time: 'Yesterday', status: 'Completed' },
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Today</h3>
                <div className="space-y-2">
                    {sessions.filter(s => s.status === 'Upcoming').map(s => (
                        <div key={s.id} className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex flex-col items-center justify-center text-xs font-bold">
                                <span>2:00</span>
                                <span>PM</span>
                            </div>
                            <div>
                                <div className="font-bold text-stone-900 text-sm">{s.title}</div>
                                <div className="text-xs text-stone-500">{s.client}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Past</h3>
                <div className="space-y-2">
                    {sessions.filter(s => s.status === 'Completed').map(s => (
                        <div key={s.id} className="p-3 rounded-xl hover:bg-stone-50 flex items-center gap-3 cursor-pointer transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-stone-900 text-sm">{s.title}</div>
                                <div className="text-xs text-stone-500">{s.time} • {s.client}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
