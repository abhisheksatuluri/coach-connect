import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3TaskCard from '@/components/v3/tasks/V3TaskCard';
import V3TaskOverlay from '@/components/v3/tasks/V3TaskOverlay';
import { Plus, CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useTasks } from '@/hooks/useTasks';

// MOCK_TASKS removed in favor of hook


const SectionHeader = ({ title, count, isOpen, onToggle }) => (
    <div
        onClick={onToggle}
        className="flex items-center gap-2 mt-6 mb-2 cursor-pointer group"
    >
        {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider">{title}</h3>
        {count > 0 && <span className="bg-stone-100 text-stone-500 text-xs px-1.5 rounded">{count}</span>}
    </div>
);

export default function V3Tasks() {
    const { data: tasks = [], isLoading } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);
    const [sectionsOpen, setSectionsOpen] = useState({ today: true, upcoming: true, someday: false });
    const [newTaskInput, setNewTaskInput] = useState('');

    const toggleSection = (s) => setSectionsOpen(prev => ({ ...prev, [s]: !prev[s] }));

    // Date helpers
    const isTodayOrOverdue = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d <= new Date(today.setHours(23, 59, 59, 999));
    };

    const isUpcoming = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d > today;
    };

    const todayTasks = tasks.filter(t => isTodayOrOverdue(t.dueDate));
    const upcomingTasks = tasks.filter(t => isUpcoming(t.dueDate));
    const somedayTasks = tasks.filter(t => !t.dueDate);

    return (
        <V3Layout title="Tasks">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Tasks</h1>
                <p className="text-stone-500 text-sm mt-1">{todayTasks.length} due today</p>
            </div>

            {/* Quick Add */}
            <div className="mb-8 relative">
                <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full h-14 pl-5 pr-12 rounded-xl bg-white border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-stone-400 shadow-sm text-lg"
                />
                <button className="absolute right-2 top-2 h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700 hover:bg-teal-100 transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="pb-20 space-y-1">
                {isLoading && <div className="text-center py-8 text-stone-500">Loading tasks...</div>}

                {!isLoading && (
                    <>
                        {/* Today */}
                        <SectionHeader
                            title="Today"
                            count={todayTasks.length}
                            isOpen={sectionsOpen.today}
                            onToggle={() => toggleSection('today')}
                        />
                        {sectionsOpen.today && todayTasks.map(task => (
                            <V3TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}

                        {/* Upcoming */}
                        <SectionHeader
                            title="Upcoming"
                            count={upcomingTasks.length}
                            isOpen={sectionsOpen.upcoming}
                            onToggle={() => toggleSection('upcoming')}
                        />
                        {sectionsOpen.upcoming && upcomingTasks.map(task => (
                            <V3TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}

                        {/* Someday */}
                        <SectionHeader
                            title="Someday"
                            count={somedayTasks.length}
                            isOpen={sectionsOpen.someday}
                            onToggle={() => toggleSection('someday')}
                        />
                        {sectionsOpen.someday && somedayTasks.map(task => (
                            <V3TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Detail Overlay */}
            <V3TaskOverlay
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
            />

        </V3Layout>
    );
}
