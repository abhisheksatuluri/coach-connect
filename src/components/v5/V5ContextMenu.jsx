import React from 'react';
import { cn } from "@/lib/utils";
import {
    Plus, Link as LinkIcon, Edit2, Trash2,
    Video, FileText, CheckSquare, User, MoreHorizontal
} from 'lucide-react';

export default function V5ContextMenu({ x, y, nodeType, nodeId, onClose, onAction }) {
    if (!x && x !== 0) return null;

    // Define actions based on node type
    const getActions = () => {
        const commonActions = [
            { label: 'Edit', icon: Edit2, action: 'edit' },
            { label: 'Delete', icon: Trash2, action: 'delete', danger: true },
        ];

        const specificActions = [];

        if (nodeType === 'client') {
            specificActions.push(
                { label: 'New Session', icon: Video, action: 'add_session' },
                { label: 'New Task', icon: CheckSquare, action: 'add_task' },
                { label: 'Add Note', icon: FileText, action: 'add_note' },
                { label: 'Refer to Practitioner', icon: User, action: 'refer' }
            );
        } else if (nodeType === 'session') {
            specificActions.push(
                { label: 'Add Note', icon: FileText, action: 'add_note' },
                { label: 'Create Task', icon: CheckSquare, action: 'add_task' }
            );
        }

        return [...specificActions, { separator: true }, ...commonActions];
    };

    const actions = getActions();

    return (
        <>
            {/* Backdrop to close on click outside */}
            <div
                className="fixed inset-0 z-50"
                onClick={onClose}
                onContextMenu={(e) => { e.preventDefault(); onClose(); }}
            />

            {/* Menu */}
            <div
                className="fixed z-[60] min-w-[180px] bg-white rounded-lg shadow-xl border border-stone-200 py-1 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: y, left: x }}
            >
                {actions.map((item, i) => (
                    item.separator ? (
                        <div key={i} className="h-px bg-stone-100 my-1" />
                    ) : (
                        <button
                            key={i}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                                item.danger ? "text-red-600 hover:bg-red-50" : "text-stone-700 hover:bg-stone-50"
                            )}
                            onClick={() => {
                                onAction(item.action, nodeId);
                                onClose();
                            }}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    )
                ))}
            </div>
        </>
    );
}
