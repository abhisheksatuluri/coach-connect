
import React from 'react';
import { ArrowLeft, Book, Calendar, User, Share, Archive, PenSquare } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { contactsData } from '@/data/v3DummyData';

export default function V3NoteDetail({ note }) {
    const { popScreen } = useStackNavigation();
    const contact = contactsData.find(c => c.id === note.contactId);

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={popScreen}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="font-semibold text-stone-900 line-clamp-1">{note.title}</div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                        <PenSquare className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">

                <div className="bg-white p-8 md:p-12 rounded-3xl border border-stone-100 shadow-sm min-h-[60vh] relative">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 mb-8 text-sm text-stone-500 pb-6 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(note.date), 'MMM do, yyyy')}
                        </div>
                        {contact && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">{contact.name}</span>
                            </div>
                        )}
                        <div className="ml-auto flex gap-2">
                            <button className="hover:text-stone-900 transition-colors"><Share className="w-4 h-4" /></button>
                            <button className="hover:text-stone-900 transition-colors"><Archive className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Body */}
                    <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6 leading-tight tracking-tight">{note.title}</h1>

                    <div className="prose prose-stone prose-lg max-w-none">
                        {note.content.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-stone-700 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="h-12" />
            </div>
        </div>
    );
}
