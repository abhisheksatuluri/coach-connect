
import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { journeysData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3JourneyDetail from './V3JourneyDetail';

export default function V3JourneyList() {
    const { pushScreen } = useStackNavigation();

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900">Journeys</h2>
                    <button className="text-sm font-medium text-teal-600">Create New</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-4">
                {journeysData.map(journey => (
                    <div
                        key={journey.id}
                        onClick={() => pushScreen(V3JourneyDetail, { journey })}
                        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors">{journey.title}</h3>
                                <div className="text-xs text-stone-500 font-medium">{journey.totalSteps} Weeks • {journey.status}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{journey.participants.length} Clients</span>
                            </div>
                            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 w-1/3 rounded-full" />
                            </div>
                            <div className="flex -space-x-2 pt-1">
                                {journey.participants.map((p, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-stone-500">
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
