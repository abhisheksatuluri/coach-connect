import React from 'react';
import { cn } from "@/lib/utils";
import { Stethoscope, UserCheck, UserPlus, ArrowRight, MoreHorizontal, ShieldCheck } from 'lucide-react';

export default function V4PractitionerFeedItem({ item, onClick }) {
    const isApproval = item.type === 'practitioner_approved';
    const isReferral = item.type === 'practitioner_referral';

    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4"
        >
            {/* Orange Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-orange-50">
                {isApproval ? (
                    <ShieldCheck className="w-5 h-5 text-orange-600" />
                ) : isReferral ? (
                    <UserPlus className="w-5 h-5 text-orange-500" />
                ) : (
                    <Stethoscope className="w-5 h-5 text-orange-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                        {isApproval ? 'Approval Update' : isReferral ? 'New Referral' : 'Practitioner Update'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {item.title}
                </h3>

                {isReferral ? (
                    <div className="flex items-center gap-2 mt-2 text-sm text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100 inline-block">
                        <span className="font-medium text-stone-900">{item.clientName}</span>
                        <ArrowRight className="w-3 h-3 text-stone-400" />
                        <span className="font-medium text-stone-900">{item.practitionerName}</span>
                    </div>
                ) : (
                    <p className="text-sm text-stone-500 line-clamp-2">
                        {item.preview}
                    </p>
                )}

                {item.status === 'pending' && (
                    <div className="mt-2 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 inline-block">
                        Pending Approval
                    </div>
                )}
            </div>

            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
