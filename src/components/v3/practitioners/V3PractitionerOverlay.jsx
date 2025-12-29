import React, { useState } from 'react';
import { Edit3, Share2, Phone, Mail, MapPin, ExternalLink, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

export default function V3PractitionerOverlay({ practitioner, isOpen, onClose }) {
    if (!practitioner) return null;

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Practitioner">
            {/* Header Profile */}
            <div className="flex flex-col items-center mb-8 border-b border-stone-100 pb-8">
                <div className="w-20 h-20 rounded-full bg-stone-200 mb-4 overflow-hidden border-2 border-white shadow-sm">
                    {practitioner.avatar ? (
                        <img src={practitioner.avatar} alt={practitioner.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-2xl font-medium bg-stone-100">
                            {practitioner.name.charAt(0)}
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-stone-900 text-center leading-tight mb-1">
                    {practitioner.name}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-teal-600 font-medium text-sm">{practitioner.specialty}</span>
                    {practitioner.status === 'Active' && <CheckCircle className="w-4 h-4 text-teal-500" />}
                </div>
            </div>

            {/* Contact Actions (Quick) */}
            <div className="flex justify-center gap-6 mb-8">
                <a href={`mailto:${practitioner.email}`} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-tea-50 group-hover:text-teal-600 transition-colors">
                        <Mail className="w-5 h-5 text-stone-600" />
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase font-medium tracking-wide">Email</span>
                </a>
                <a href={`tel:${practitioner.phone}`} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-tea-50 group-hover:text-teal-600 transition-colors">
                        <Phone className="w-5 h-5 text-stone-600" />
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase font-medium tracking-wide">Call</span>
                </a>
                <a href={practitioner.website} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-tea-50 group-hover:text-teal-600 transition-colors">
                        <ExternalLink className="w-5 h-5 text-stone-600" />
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase font-medium tracking-wide">Web</span>
                </a>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 mb-8">
                {/* About */}
                <div>
                    <h4 className="text-xs font-semibold text-stone-900 mb-2">About</h4>
                    <p className="text-stone-600 text-sm leading-relaxed">
                        {practitioner.bio}
                    </p>
                </div>

                {/* Location */}
                <div>
                    <h4 className="text-xs font-semibold text-stone-900 mb-2">Location</h4>
                    <div className="flex items-start gap-2 text-sm text-stone-600">
                        <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                        {practitioner.address}
                    </div>
                </div>

                {/* Referrals */}
                <div>
                    <h4 className="text-xs font-semibold text-stone-900 mb-2 flex items-center justify-between">
                        Referrals
                        <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-[10px] items-center flex gap-1">
                            <Users className="w-3 h-3" /> {practitioner.referrals?.length || 0}
                        </span>
                    </h4>
                    {practitioner.referrals && practitioner.referrals.length > 0 ? (
                        <div className="space-y-2">
                            {practitioner.referrals.map((ref, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                    <span className="text-sm font-medium text-stone-900">{ref.clientName}</span>
                                    <span className="text-xs text-stone-500">{ref.date}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-stone-400 italic">No referrals yet.</p>
                    )}
                </div>
            </div>

            {/* Pending Approval Workflow */}
            {practitioner.status === 'Pending' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-8">
                    <h4 className="text-amber-800 font-medium text-sm mb-1">Approval Required</h4>
                    <p className="text-amber-700/80 text-xs mb-4">This practitioner has requested to join your network.</p>
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0">
                            Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-amber-200 text-amber-800 hover:bg-amber-100">
                            Decline
                        </Button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto flex gap-3 pb-safe">
                <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl h-12 shadow-sm border-0">
                    <Share2 className="w-4 h-4 mr-2" /> Refer Client
                </Button>
                <Button variant="outline" className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-12">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Info
                </Button>
            </div>
        </V3Overlay>
    );
}
