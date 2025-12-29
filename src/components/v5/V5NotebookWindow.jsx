import React from 'react';
import { cn } from "@/lib/utils";
import { FileText, Calendar, Trash2, Edit2, Link as LinkIcon, Download } from 'lucide-react';

export default function V5NotebookWindow({ data }) {
    const note = data || { title: 'Note', content: '' };
    const isFile = note.type === 'file';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold uppercase tracking-wide">
                        {note.category || 'Personal Note'}
                    </div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last updated 2 hours ago
                    </div>
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-tight focus:outline-none" contentEditable>{note.title}</h2>

                {note.linkedTo && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded w-fit border border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors">
                        <LinkIcon className="w-3 h-3" />
                        Linked to <span className="font-semibold text-stone-700">{note.linkedTo.name}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {isFile ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-stone-200 flex items-center justify-center mb-4">
                            <span className="text-xs font-bold text-stone-500 uppercase">PDF</span>
                        </div>
                        <h4 className="font-medium text-stone-900 mb-1">{note.fileName || 'document.pdf'}</h4>
                        <p className="text-xs text-stone-500 mb-4">2.4 MB • Uploaded Yesterday</p>
                        <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed outline-none" contentEditable>
                        <p>{note.content || "Start typing your note here..."}</p>
                        {/* Placeholder mock content if empty */}
                        {!note.content && (
                            <>
                                <p>Reflecting on the last session, I noticed a significant improvement in the client's ability to self-regulate.</p>
                                <ul>
                                    <li>Action item 1: Send resource on breathing techniques</li>
                                    <li>Action item 2: Review homework next week</li>
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex justify-between items-center text-xs">
                <button className="text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                </button>
                <div className="flex gap-3">
                    <button className="text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}
