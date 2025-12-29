import React from 'react';
import { cn } from "@/lib/utils";
import { Book, FileText, Paperclip, MoreHorizontal, FileImage } from 'lucide-react';

export default function V4NotebookFeedItem({ item, onClick }) {
    const isFile = item.type === 'file_uploaded';

    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4"
        >
            {/* Pink Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-pink-50">
                {isFile ? (
                    <Paperclip className="w-5 h-5 text-pink-500" />
                ) : (
                    <Book className="w-5 h-5 text-pink-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-pink-500">
                        {isFile ? 'File Upload' : 'Note Added'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 group-hover:text-pink-600 transition-colors">
                    {item.title}
                </h3>

                {isFile ? (
                    <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-stone-50 border border-stone-100 max-w-sm">
                        <div className="w-8 h-8 rounded bg-white border border-stone-200 flex items-center justify-center">
                            <FileImage className="w-4 h-4 text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-stone-700 truncate">{item.fileName || item.title}</div>
                            <div className="text-[10px] text-stone-400">PDF • 2.4 MB</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-stone-500 line-clamp-2">
                        {item.preview}
                    </p>
                )}

                {item.linkedEntity && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                        <span>Linked to</span>
                        <span className="font-medium text-stone-600 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {item.linkedEntity}
                        </span>
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
