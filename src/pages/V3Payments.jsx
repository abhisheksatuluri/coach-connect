import React from 'react';
import V3Layout from '@/components/v3/V3Layout';
import { TrendingUp, Download } from 'lucide-react';

export default function V3Payments() {
    return (
        <V3Layout title="Payments" initialActiveTab="more">
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Summary Card */}
                <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-lg">
                    <div className="text-stone-400 text-sm font-medium mb-1">Total Revenue (Dec)</div>
                    <div className="text-4xl font-bold">$12,450.00</div>
                    <div className="mt-4 flex gap-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                            <TrendingUp className="w-4 h-4" /> +15% vs last month
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 font-bold text-stone-900">Recent Transactions</div>
                    <div className="divide-y divide-stone-50">
                        {[
                            { id: 1, desc: '12-Week Package', client: 'Mike Ross', amount: '$2,500', date: 'Today', status: 'Paid' },
                            { id: 2, desc: 'Single Session', client: 'Jessica Pearson', amount: '$250', date: 'Yesterday', status: 'Pending' },
                        ].map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${tx.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {tx.status === 'Paid' ? '✓' : '!'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-stone-900">{tx.desc}</div>
                                        <div className="text-xs text-stone-500">{tx.client} • {tx.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-stone-900">{tx.amount}</div>
                                    <button className="text-xs text-stone-400 hover:text-stone-900 flex items-center gap-1 justify-end mt-1">
                                        <Download className="w-3 h-3" /> Invoice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </V3Layout>
    );
}
