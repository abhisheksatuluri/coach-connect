import React from 'react';
import { cn } from "@/lib/utils";
import { User, Phone, Mail, Globe, MapPin, UserPlus, Shield } from 'lucide-react';

export default function V5PractitionerWindow({ data }) {
    const pract = data || { name: 'Practitioner', status: 'active', referrals: [] };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-white border-b border-orange-100">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 border-4 border-white shadow-sm overflow-hidden text-2xl">
                        {pract.avatar ? <img src={pract.avatar} alt={pract.name} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-stone-900 leading-tight">{pract.name}</h2>
                        <div className="text-orange-600 font-medium text-sm mt-1 mb-2">{pract.specialty || 'General Practitioner'}</div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                pract.status === 'active' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", pract.status === 'active' ? "bg-green-500" : "bg-amber-500")} />
                                {pract.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Content */}
            <div className="flex-1 overflow-y-auto p-0">

                {/* Contact Info Section */}
                <div className="p-6 space-y-3 bg-white">
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span className="truncate">dr.chen@clinic.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>+44 20 7123 4567</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                        <Globe className="w-4 h-4 text-stone-400" />
                        <span>www.mindclinic.co.uk</span>
                    </div>
                </div>

                <div className="h-2 bg-stone-50 border-t border-b border-stone-100" />

                {/* Referrals Section */}
                <div className="p-6">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex justify-between">
                        Referrals
                        <span className="bg-stone-100 text-stone-600 px-1.5 rounded text-[10px] py-0.5">3 Total</span>
                    </h3>

                    <div className="space-y-3">
                        {(pract.referrals || ['Sarah Connor', 'Mike Ross']).map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-stone-100 bg-white hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                                        {ref.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900 group-hover:text-orange-700 transition-colors">{ref}</div>
                                        <div className="text-[10px] text-stone-400">Referred Oct 2024</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    New Referral
                </button>
                <button className="p-2 text-stone-400 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                    <Shield className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
