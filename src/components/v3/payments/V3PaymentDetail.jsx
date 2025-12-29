
import React from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Download, Share2, DollarSign, Calendar, User } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { contactsData } from '@/data/v3DummyData';

export default function V3PaymentDetail({ payment }) {
    const { popScreen } = useStackNavigation();
    const contact = contactsData.find(c => c.id === payment.contactId);

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-3">
                    <button
                        onClick={popScreen}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="font-semibold text-stone-900">Transaction Details</div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Receipt Card */}
                <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-lg relative overflow-hidden">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

                    <div className="flex flex-col items-center text-center space-y-2 mb-8 mt-2">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-2",
                            payment.status === 'Paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        )}>
                            <DollarSign className="w-7 h-7" />
                        </div>
                        <div className="text-sm font-bold text-stone-400 uppercase tracking-wider">{payment.method}</div>
                        <div className="text-4xl font-bold text-stone-900">${payment.amount.toFixed(2)}</div>
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                            payment.status === 'Paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {payment.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {payment.status}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-dashed border-stone-200 pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-stone-500 font-medium">Date</span>
                            <span className="text-stone-900 font-semibold">{format(new Date(payment.date), 'MMM do, yyyy • h:mm a')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-stone-500 font-medium">Transaction ID</span>
                            <span className="text-stone-900 font-mono text-sm">TXN-{payment.id.toUpperCase()}</span>
                        </div>
                        {contact && (
                            <div className="flex justify-between items-center">
                                <span className="text-stone-500 font-medium">Client</span>
                                <span className="text-stone-900 font-semibold flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-stone-200 text-[10px] flex items-center justify-center font-bold">
                                        {contact.name.charAt(0)}
                                    </div>
                                    {contact.name}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-stone-500 font-medium">Service</span>
                            <span className="text-stone-900 font-semibold">{payment.description || 'Professional Services'}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100">
                        <div className="flex justify-between items-end">
                            <span className="text-stone-500 font-bold uppercase text-xs">Total Paid</span>
                            <span className="text-2xl font-bold text-stone-900">${payment.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
                        Need help with this transaction?
                    </button>
                </div>

                <div className="h-12" />
            </div>
        </div>
    );
}
