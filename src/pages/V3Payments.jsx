import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3PaymentCard from '@/components/v3/payments/V3PaymentCard';
import V3PaymentOverlay from '@/components/v3/payments/V3PaymentOverlay';
import { Plus, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

import { usePayments } from '@/hooks/usePayments';

// MOCK_INVOICES removed in favor of hook


export default function V3Payments() {
    const { data: invoices = [], isLoading } = usePayments();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = invoices.filter(inv => {
        return activeFilter === 'All' || inv.status === activeFilter;
    });

    // Helper to parse amount
    const parseAmount = (amt) => {
        if (typeof amt === 'number') return amt;
        if (!amt) return 0;
        return parseFloat(amt.replace(/[^0-9.-]+/g, ""));
    };

    const totalRevenue = invoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + parseAmount(i.amount), 0);

    const totalOutstanding = invoices
        .filter(i => i.status === 'Pending' || i.status === 'Overdue')
        .reduce((sum, i) => sum + parseAmount(i.amount), 0);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
    };

    return (
        <V3Layout title="Payments">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Payments</h1>
                <p className="text-stone-500 text-sm mt-1">Invoices and billing</p>
            </div>

            {/* Summary Card */}
            <div className="bg-stone-900 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-stone-900/10 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-stone-300">Outstanding: <span className="text-white font-medium">{formatCurrency(totalOutstanding)}</span></span>
                    </div>
                </div>
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-900/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 right-20 w-24 h-24 bg-rose-900/20 rounded-full blur-2xl"></div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar sm:justify-center">
                {['All', 'Pending', 'Paid', 'Overdue'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap",
                            activeFilter === filter
                                ? "bg-white text-stone-900 border-stone-200 shadow-sm"
                                : "bg-transparent text-stone-500 border-transparent hover:bg-stone-100"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="pb-20">
                {isLoading ? (
                    <div className="text-center py-12 text-stone-500">Loading invoices...</div>
                ) : filtered.length > 0 ? filtered.map(inv => (
                    <V3PaymentCard
                        key={inv.id}
                        invoice={inv}
                        onClick={() => setSelectedInvoice(inv)}
                    />
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No invoices found</h3>
                        <p className="text-stone-500 text-sm mt-1">Create an invoice to get started.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3PaymentOverlay
                invoice={selectedInvoice}
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

        </V3Layout>
    );
}
