import React from 'react';
import { TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function V4PaymentSummaryCard() {
    return (
        <div className="mx-6 mb-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm flex items-center justify-between pointer-events-none select-none">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-teal-50 text-teal-600">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-medium text-stone-500">This Month</div>
                    <div className="text-2xl font-bold text-stone-900">£4,250.00</div>
                </div>
            </div>

            <div className="flex gap-6">
                <div className="text-right">
                    <div className="text-xs font-medium text-amber-500 flex items-center justify-end gap-1 mb-0.5">
                        <Clock className="w-3 h-3" /> Outstanding
                    </div>
                    <div className="text-lg font-bold text-stone-900">£850.00</div>
                </div>

                <div className="text-right">
                    <div className="text-xs font-bold text-rose-500 flex items-center justify-end gap-1 mb-0.5">
                        <AlertCircle className="w-3 h-3" /> Overdue
                    </div>
                    <div className="text-lg font-bold text-stone-900">£150.00</div>
                </div>
            </div>
        </div>
    );
}
