import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { Stethoscope, Phone, Mail, Globe, MapPin, ShieldCheck, UserPlus, Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4PractitionerSheet({ practitioner, isOpen, onClose }) {
    if (!practitioner) return null;

    const isPending = practitioner.status === 'pending';

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Practitioner Profile"
        >
            <div className="space-y-6 pb-20">
                {/* Header Profile */}
                <div className="text-center pt-2">
                    <div className="w-24 h-24 mx-auto bg-stone-100 rounded-full border-4 border-white shadow-sm mb-4 overflow-hidden relative">
                        {/* Placeholder Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                            <Stethoscope className="w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900">{practitioner.name || 'Dr. Emily Chen'}</h2>
                    <p className="text-stone-500 font-medium">Clinical Psychologist</p>

                    <div className="flex justify-center gap-2 mt-3">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border",
                            isPending ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {isPending ? 'Pending Approval' : 'Active Partner'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-xs font-medium border border-stone-200">
                            CBT Specialist
                        </span>
                    </div>
                </div>

                {/* Pending Action Banner */}
                {isPending && (
                    <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex flex-col items-center text-center">
                        <ShieldCheck className="w-6 h-6 text-orange-500 mb-2" />
                        <h4 className="font-bold text-stone-900 text-sm">Approval Required</h4>
                        <p className="text-xs text-stone-600 mb-3 max-w-[240px]">This practitioner has been added to the system but requires administrator approval to receive referrals.</p>
                        <div className="flex gap-2 w-full">
                            <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button className="flex-1 py-2 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <X className="w-4 h-4" /> Decline
                            </button>
                        </div>
                    </div>
                )}

                {/* Bio */}
                <div className="prose prose-stone prose-sm max-w-none">
                    <p className="text-stone-700 leading-relaxed text-center">
                        Specializes in anxiety disorders and trauma recovery with over 10 years of clinical experience. Integrated approach using CBT and mindfulness techniques.
                    </p>
                </div>

                {/* Contact Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-stone-300 transition-colors">
                        <Mail className="w-5 h-5 text-stone-400 group-hover:text-stone-600 mb-1" />
                        <span className="text-xs text-stone-900 font-medium truncate w-full">emily.c@example.com</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-stone-300 transition-colors">
                        <Phone className="w-5 h-5 text-stone-400 group-hover:text-stone-600 mb-1" />
                        <span className="text-xs text-stone-900 font-medium">+44 7700 900000</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-stone-300 transition-colors">
                        <Globe className="w-5 h-5 text-stone-400 group-hover:text-stone-600 mb-1" />
                        <span className="text-xs text-stone-900 font-medium">dremilychen.com</span>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-stone-300 transition-colors">
                        <MapPin className="w-5 h-5 text-stone-400 group-hover:text-stone-600 mb-1" />
                        <span className="text-xs text-stone-900 font-medium">London, UK</span>
                    </div>
                </div>

                <div className="h-px bg-stone-100 my-4" />

                {/* Referrals */}
                <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Active Referrals</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl hover:border-orange-300 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                    SM
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-stone-900">Sarah Mitchell</div>
                                    <div className="text-xs text-stone-500">Referred Dec 10</div>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!isPending && (
                    <div className="flex gap-3 pt-4 border-t border-stone-100">
                        <button className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="w-4 h-4" /> Refer Client
                        </button>
                        <button className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-medium transition-colors">
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </V4BottomSheet>
    );
}
