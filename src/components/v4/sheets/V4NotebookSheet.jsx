import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { Book, Calendar, User, Video, Paperclip, Trash2, Edit2, Share2, Download } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4NotebookSheet({ note, isOpen, onClose }) {
    if (!note) return null;

    const isFile = note.type === 'file_uploaded';

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={isFile ? "File Details" : "Note Details"}
        >
            <div className="space-y-6 pb-20">
                {/* Header Context */}
                <div className="flex items-center gap-3">
                    <div className="px-2 py-0.5 rounded bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wide border border-pink-100">
                        {note.category || 'General Note'}
                    </div>
                    <span className="text-stone-300 text-xs">|</span>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        {note.timestamp || 'Today'}
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-4 leading-snug">
                        {note.title}
                    </h2>

                    {isFile ? (
                        <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center">
                            <div className="w-16 h-16 mx-auto bg-white rounded-lg border border-stone-200 shadow-sm flex items-center justify-center mb-4">
                                <Paperclip className="w-8 h-8 text-stone-400" />
                            </div>
                            <div className="text-sm font-medium text-stone-900 mb-1">{note.fileName || 'document.pdf'}</div>
                            <div className="text-xs text-stone-500 mb-4">PDF • 2.4 MB</div>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm">
                                <Download className="w-4 h-4" /> Download File
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-stone prose-sm max-w-none">
                            <p className="leading-relaxed text-stone-700">
                                {note.fullContent || note.preview || "No additional content available for this note."}
                            </p>
                            <p className="leading-relaxed text-stone-700 mt-4">
                                Discussed potential blockers for the upcoming week. Client mentioned feeling overwhelmed by work schedule. Suggested time-blocking exercises.
                            </p>
                        </div>
                    )}
                </div>

                <div className="h-px bg-stone-100 my-6" />

                {/* Linked Entities */}
                <div>
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Linked to</h4>
                    <div className="flex flex-wrap gap-2">
                        {note.linkedEntity && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg shadow-sm hover:border-blue-300 cursor-pointer transition-colors group">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                    <User className="w-3 h-3" />
                                </div>
                                <span className="text-sm font-medium text-stone-700 group-hover:text-blue-700">{note.linkedEntity}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg shadow-sm hover:border-violet-300 cursor-pointer transition-colors group">
                            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-[10px] font-bold">
                                <Video className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium text-stone-700 group-hover:text-violet-700">Weekly Check-in</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                    <button className="p-2 text-stone-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-stone-600 font-medium text-sm hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-sm shadow-sm transition-colors flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit Note
                        </button>
                    </div>
                </div>
            </div>
        </V4BottomSheet>
    );
}
