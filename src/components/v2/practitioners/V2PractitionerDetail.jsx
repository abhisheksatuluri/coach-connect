import React, { useState } from 'react';
import {
    MoreHorizontal, Edit, UserCheck, UserX, Send, MapPin, Globe,
    CheckCircle, XCircle
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

export default function V2PractitionerDetail({ practitioner }) {
    if (!practitioner) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a practitioner to view details
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300 ring-4 ring-slate-800">
                            {practitioner.avatar}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{practitioner.name}</h2>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/20">{practitioner.specialty}</Badge>
                                <span className={cn("text-xs px-2 py-0.5 rounded-full border",
                                    practitioner.status === 'Active' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                                        practitioner.status === 'Pending Approval' ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
                                            "border-slate-500/30 text-slate-400"
                                )}>
                                    {practitioner.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Approval Actions */}
                {practitioner.status === 'Pending Approval' && (
                    <div className="flex items-center gap-2 mt-4 p-3 bg-amber-500/10 rounded border border-amber-500/20">
                        <span className="text-xs text-amber-200 font-medium flex-1">Application pending review</span>
                        <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white border-0 text-xs gap-1">
                            <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs gap-1">
                            <XCircle className="w-3 h-3" /> Reject
                        </Button>
                    </div>
                )}

                {/* Refer Action */}
                {practitioner.status === 'Active' && (
                    <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white border-0">
                        <Send className="w-4 h-4 mr-2" /> Refer Client
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">

                    {/* 1. Bio & Contact */}
                    <SectionHeader title="Professional Profile" />
                    <div className="bg-slate-800/20 rounded-lg p-4 border border-slate-800 mb-6">
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{practitioner.bio}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-4 h-4" /> {practitioner.location}
                            </div>
                            {practitioner.website && (
                                <div className="flex items-center gap-2 text-indigo-400 hover:underline cursor-pointer">
                                    <Globe className="w-4 h-4" /> Website
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Credentials */}
                    <SectionHeader title="Credentials" />
                    <div className="flex flex-wrap gap-2 mb-6">
                        {practitioner.credentials.map((cred, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                {cred}
                            </span>
                        ))}
                    </div>

                    {/* 3. Referral History */}
                    <SectionHeader title="Recent Referrals" />
                    <div className="space-y-2">
                        {practitioner.history.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-800 hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {item.clientAvatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-200">{item.clientName}</div>
                                        <div className="text-xs text-slate-500">{item.date}</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border",
                                    item.status === 'Completed' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-slate-400 border-slate-700"
                                )}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
