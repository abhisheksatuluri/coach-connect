
import React from 'react';
import { cn } from "@/lib/utils";
import { createPortal } from 'react-dom';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FileText, CheckSquare, Settings as Cog, Paperclip, BookOpen
} from 'lucide-react';

import V3AddNote from '../forms/V3AddNote';
import V3CreateTask from '../forms/V3CreateTask';
import V3KnowledgeBase from '../knowledgebase/V3KnowledgeBase';

export default function V3WidgetMenu({ isOpen, onClose }) {
    const { pushScreen } = useStackNavigation();

    if (typeof document === 'undefined') return null;

    const handleAction = (id) => {
        onClose();
        // Small timeout to allow sheet to close before pushing? 
        // Or push immediately. Pushing immediately is snappier, the sheet will disappear as the new screen slides in.
        // Actually, if we push, the new screen slides over everything. The sheet is on top of everything though (z-index).
        // If we close the sheet, it slides down.
        // Let's close then push, or push then close.
        // "When user taps an option card it has a subtle press animation then the sheet slides down and the corresponding full screen opens"

        // We'll close the sheet first (animating out), then after a tiny delay push the screen?
        // Or just push. Stack is z-50. Sheet is z-71. 
        // If sheet stays open, it will cover the pushed screen. We must close it.


        setTimeout(() => {
            switch (id) {
                case 'note':
                    pushScreen(V3AddNote, {}, { isWidget: true });
                    break;
                case 'task':
                    pushScreen(V3CreateTask, {}, { isWidget: true });
                    break;
                case 'kb':
                    pushScreen(V3KnowledgeBase, {}, { isWidget: true });
                    break;
                default:
                    console.log("Action not implemented:", id);
            }
        }, 150); // Wait 150ms for sheet to start sliding down
    };


    const options = [
        {
            id: 'note',
            title: 'Add Note',
            subtitle: 'Add note to current context',
            icon: FileText,
            color: 'bg-pink-100 text-pink-600'
        },
        {
            id: 'task',
            title: 'Create Task',
            subtitle: 'Create task for this view',
            icon: CheckSquare,
            color: 'bg-orange-100 text-orange-600'
        },
        {
            id: 'kb',
            title: 'Knowledge Base',
            subtitle: 'Search articles and insights',
            icon: BookOpen,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            id: 'file',
            title: 'Attach File',
            subtitle: 'Upload document or image',
            icon: Paperclip,
            color: 'bg-blue-100 text-blue-600'
        },
    ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
                        onClick={onClose}
                    />

                    {/* Menu Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "fixed z-[71] bg-white shadow-2xl overflow-hidden",
                            "bottom-0 left-0 right-0 rounded-t-[20px] md:bottom-auto md:left-auto md:right-4 md:top-16 md:w-80 md:rounded-2xl border border-stone-100 pb-6 md:pb-2"
                        )}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                            <div className="w-10 h-1.5 bg-stone-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-4 py-3 md:pt-4">
                            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Quick Actions</h2>
                        </div>

                        {/* Grid of Options */}
                        <div className="p-2 px-3 space-y-3">
                            {options.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <motion.button
                                        key={opt.id}
                                        whileTap={{ scale: 0.98, backgroundColor: "#fafaf9" }}
                                        onClick={() => handleAction(opt.id)}
                                        className="w-full flex items-center gap-4 p-3 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
                                        style={{ height: '72px' }}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                            opt.color
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-900 text-base">{opt.title}</div>
                                            <div className="text-xs text-stone-500 font-medium">{opt.subtitle}</div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

