import React from 'react';
import { cn } from "@/lib/utils";

export default function V3ClientCard({ client, onClick }) {
    return (
        <div
            onClick={onClick}
            className="group flex items-center h-[72px] px-4 cursor-pointer border-b border-stone-100 hover:bg-[#F5F5F4] transition-colors -mx-4 sm:mx-0 sm:rounded-xl sm:border sm:mb-2 sm:h-auto sm:py-3"
        >
            {/* Left: Avatar */}
            <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-lg font-medium overflow-hidden shadow-sm">
                    {client.avatar ? (
                        <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{client.initials}</span>
                    )}
                </div>
            </div>

            {/* Middle: Name */}
            <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-medium text-stone-900 truncate group-hover:text-teal-900 transition-colors">
                    {client.name}
                </h3>
            </div>

            {/* Right: Status */}
            <div className="flex-shrink-0 ml-4">
                <span className={cn(
                    "text-sm font-medium",
                    client.status === 'Active' ? "text-teal-700" :
                        client.status === 'New' ? "text-rose-500" : "text-stone-400"
                )}>
                    {client.status}
                </span>
            </div>
        </div>
    );
}
