import React from 'react';
import {
    MoreHorizontal, Edit, Download, Send, CreditCard, RotateCcw,
    User, CheckCircle, Clock, AlertCircle, ExternalLink, Copy
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SectionHeader = ({ title }) => (
    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-6 first:mt-0">
        {title}
    </h4>
);

export default function V2PaymentDetail({ payment }) {
    if (!payment) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select an invoice to view details
        </div>
    );

    const statusConfig = {
        'Paid': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
        'Pending': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
        'Overdue': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertCircle },
    };

    const status = statusConfig[payment.status] || statusConfig['Pending'];
    const StatusIcon = status.icon;

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-mono font-bold text-white">#{payment.invoiceNumber}</h2>
                            <Badge className={cn("gap-1 pl-1", status.bg, status.color, status.border)}>
                                <StatusIcon className="w-3 h-3" /> {payment.status}
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">{payment.amount}</div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Download PDF">
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white" title="Send Reminder">
                            <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-2">
                    {payment.status !== 'Paid' && (
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                            Mark as Paid
                        </Button>
                    )}
                    {payment.status === 'Paid' && (
                        <Button size="sm" variant="outline" className="h-8 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Refund
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">

                    {/* 1. Client Info */}
                    <SectionHeader title="Bill To" />
                    <div className="flex items-center gap-4 p-3 bg-slate-800/30 rounded border border-slate-800 mb-6 cursor-pointer hover:bg-slate-800/50 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            {payment.clientAvatar}
                        </div>
                        <div>
                            <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                {payment.clientName}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-xs text-slate-500">{payment.clientEmail}</div>
                        </div>
                    </div>

                    {/* 2. Invoice Details */}
                    <SectionHeader title="Invoice Details" />
                    <div className="bg-slate-800/10 rounded border border-slate-800 overflow-hidden mb-6">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 p-2 bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                            <div className="col-span-6">Item</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        {/* Line Items */}
                        <div className="p-2 space-y-2">
                            {payment.lineItems.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 text-sm text-slate-300">
                                    <div className="col-span-6 truncate">{item.desc}</div>
                                    <div className="col-span-2 text-right text-slate-500">{item.qty}</div>
                                    <div className="col-span-2 text-right text-slate-500">{item.price}</div>
                                    <div className="col-span-2 text-right font-medium">{item.total}</div>
                                </div>
                            ))}
                        </div>
                        {/* Totals */}
                        <div className="border-t border-slate-800 p-3 bg-slate-800/20 space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Subtotal</span>
                                <span>{payment.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/50 mt-2">
                                <span>Total Due</span>
                                <span>{payment.amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Link */}
                    {payment.status !== 'Paid' && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-950/20 border border-indigo-500/20 rounded mb-6">
                            <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="flex-1 truncate">
                                <div className="text-[10px] text-indigo-300 font-bold uppercase">Payment Link</div>
                                <div className="text-xs text-indigo-200 truncate select-all">https://pay.mindsai.com/inv/{payment.invoiceNumber}</div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-indigo-400 hover:text-white hover:bg-indigo-500/30">
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}

                    {/* 3. Package Info */}
                    {payment.packageInfo && (
                        <>
                            <SectionHeader title="Linked Package" />
                            <div className="p-3 bg-slate-800/30 rounded border border-slate-800 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-200">{payment.packageInfo.name}</span>
                                    <span className="text-xs text-slate-500">{payment.packageInfo.used}/{payment.packageInfo.total} Sessions</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${(payment.packageInfo.used / payment.packageInfo.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* 4. Timeline */}
                    <SectionHeader title="History" />
                    <div className="space-y-4 pl-2 border-l border-slate-800 ml-2">
                        {payment.timeline.map((event, i) => (
                            <div key={i} className="relative pl-6">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-600" />
                                <div className="text-sm font-medium text-slate-300">{event.action}</div>
                                <div className="text-xs text-slate-500">{event.date}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
