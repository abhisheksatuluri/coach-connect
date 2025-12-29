import React from 'react';
import { TrendingUp, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { paymentsData, contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3PaymentDetail from './V3PaymentDetail';
import { format } from 'date-fns';
import PremiumScrollContainer from '@/components/v3/shared/PremiumScrollContainer';
import ScrollShrinkHeader from '@/components/v3/shared/ScrollShrinkHeader';

export default function V3PaymentList() {
    const { pushScreen } = useStackNavigation();

    // Calculate total revenue from 'Paid' transactions
    const totalRevenue = paymentsData
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            <ScrollShrinkHeader title="Payments" showBack={false} />

            <PremiumScrollContainer>
                {/* Summary Card Area - Not sticky, scrolls with content */}
                <div className="p-4 bg-[#FAFAF9]">
                    <div className="bg-stone-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group cursor-default">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-stone-400 text-sm font-medium mb-1">Total Revenue</div>
                            <div className="text-4xl font-bold">${totalRevenue.toLocaleString()}</div>
                            <div className="mt-4 flex gap-4">
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" /> +12% this month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Recent Transactions</h3>
                    <div className="max-w-3xl mx-auto space-y-2">
                        {paymentsData.map((tx) => {
                            const contact = contactsData.find(c => c.id === tx.contactId);
                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => pushScreen(V3PaymentDetail, { payment: tx })}
                                    className="p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between hover:bg-stone-50 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                            tx.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {tx.status === 'Paid' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-stone-900 group-hover:text-teal-700 transition-colors">{tx.description || 'Service Payment'}</div>
                                            <div className="text-xs text-stone-500 flex items-center gap-1">
                                                {contact ? contact.name : 'Unknown Client'} • {format(new Date(tx.date), 'MMM d')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-stone-900">${tx.amount.toFixed(0)}</div>
                                        <div className={cn("text-[10px] uppercase font-bold tracking-wider",
                                            tx.status === 'Paid' ? "text-emerald-600" : "text-amber-600"
                                        )}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </PremiumScrollContainer>
        </div>
    );
}
