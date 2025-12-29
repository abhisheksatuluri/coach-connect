import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2PaymentCard from '@/components/v2/payments/V2PaymentCard';
import V2PaymentDetail from '@/components/v2/payments/V2PaymentDetail';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { usePayments } from '@/hooks/usePayments';

// MOCK_PAYMENTS removed in favor of hook



const PaymentsListContent = ({ payments, selectedId, onSelect }) => {
    const [activeFilter, setActiveFilter] = useState('All');

    // Mock sort/filter logic would go here
    const filtered = activeFilter === 'All' ? payments : payments.filter(p => p.status === activeFilter);

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Payments</h1>
                        <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{payments.length}</span>
                    </div>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                        <Plus className="w-3 h-3" /> New Invoice
                    </Button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Revenue MTD</div>
                        <div className="text-sm font-bold text-emerald-400">$4,350</div>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Outstanding</div>
                        <div className="text-sm font-bold text-amber-400">$1,350</div>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Overdue</div>
                        <div className="text-sm font-bold text-rose-400">$150</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {['All', 'Pending', 'Paid', 'Overdue'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded transition-colors",
                                    activeFilter === filter
                                        ? "bg-slate-700 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Sort">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Filter">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filtered.map(payment => (
                    <V2PaymentCard
                        key={payment.id}
                        payment={payment}
                        isSelected={selectedId === payment.id}
                        onClick={() => onSelect(payment.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function V2Payments() {
    const { data: payments = [], isLoading } = usePayments();
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const selectedPayment = payments.find(p => p.id === selectedPaymentId) || payments[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedPaymentId && payments.length > 0) {
            setSelectedPaymentId(payments[0].id);
        }
    }, [payments, selectedPaymentId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading payments...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <PaymentsListContent
                        payments={payments}
                        selectedId={selectedPaymentId || (payments[0]?.id)}
                        onSelect={setSelectedPaymentId}
                    />
                }
                secondaryContent={
                    <V2PaymentDetail payment={selectedPayment} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
