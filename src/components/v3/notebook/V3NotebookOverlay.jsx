import React, { useState } from 'react';
import { Share2, Trash, Download, FileText, Calendar, User, Map, Edit3, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

export default function V3NotebookOverlay({ note, isOpen, onClose }) {
    if (!note) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content || "");

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Note">
            <div className="mb-6 pb-6 border-b border-stone-100">
                <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        note.category === 'Client' ? "bg-teal-50 text-teal-700 border-teal-100" :
                            note.category === 'Session' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                "bg-stone-50 text-stone-600 border-stone-200"
                    )}>
                        {note.category} Note
                    </span>
                    {note.linkedEntity && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                            • Linked to <span className="text-stone-600 font-medium cursor-pointer hover:underline">{note.linkedEntity}</span>
                        </span>
                    )}
                </div>
                <input
                    defaultValue={note.title}
                    className="w-full text-2xl font-medium text-stone-900 bg-transparent border-none outline-none placeholder:text-stone-400"
                    placeholder="Note title"
                />
            </div>

            {/* Content */}
            <div className="min-h-[300px] mb-8">
                {note.type === 'file' ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                        <FileText className="w-16 h-16 text-stone-300 mb-4" />
                        <p className="text-stone-600 font-medium mb-1">{note.fileName}</p>
                        <p className="text-stone-400 text-sm mb-6">{note.fileSize} • {note.fileType}</p>
                        <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-white rounded-lg">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                    </div>
                ) : (
                    isEditing ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[400px] p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-teal-500 focus:ring-0 resize-none text-stone-800 leading-relaxed"
                            placeholder="Start typing..."
                        />
                    ) : (
                        <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed whitespace-pre-line">
                            {content || note.content}
                            {note.contentLong && note.contentLong.map((para, i) => (
                                <p key={i} className="mt-4">{para}</p>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
                <div>
                    Created {note.dateInfo || 'Recently'} • Last updated {note.timestamp}
                </div>
                {note.tags && (
                    <div className="flex gap-2">
                        {note.tags.map(tag => (
                            <span key={tag} className="text-stone-500">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 pb-safe">
                {note.type !== 'file' && (
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            "flex-1 h-12 rounded-xl shadow-sm border-0 transition-colors",
                            isEditing ? "bg-stone-900 hover:bg-stone-800 text-white" : "bg-teal-700 hover:bg-teal-800 text-white"
                        )}
                    >
                        {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Changes</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit Note</>}
                    </Button>
                )}
                <Button variant="outline" className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-12">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button variant="ghost" className="h-12 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-4">
                    <Trash className="w-5 h-5" />
                </Button>
            </div>
        </V3Overlay>
    );
}
