import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2TaskCard from '@/components/v2/tasks/V2TaskCard';
import V2TaskDetail from '@/components/v2/tasks/V2TaskDetail';
import { Plus, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { useTasks } from '@/hooks/useTasks';

// MOCK_TASKS removed in favor of hook



const TasksListContent = ({ tasks, selectedId, onSelect, onToggle }) => (
    <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Tasks</h1>
                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => !t.completed).length} open</span>
                </div>
                <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                    <Plus className="w-3 h-3" /> New Task
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 pb-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {['All', 'My Tasks', 'Client Tasks', 'Overdue'].map(filter => (
                        <button key={filter} className="px-3 py-1 text-xs font-medium rounded hover:bg-slate-700 text-slate-300 transition-colors first:bg-slate-700 first:text-white first:shadow-sm">
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Filter">
                        <Filter className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">To Do</h3>
            {tasks.filter(t => !t.completed).map(task => (
                <V2TaskCard
                    key={task.id}
                    task={task}
                    isSelected={selectedId === task.id}
                    onClick={() => onSelect(task.id)}
                    onToggle={onToggle}
                />
            ))}

            {tasks.some(t => t.completed) && (
                <>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 pl-1">Completed</h3>
                    <div className="opacity-60">
                        {tasks.filter(t => t.completed).map(task => (
                            <V2TaskCard
                                key={task.id}
                                task={task}
                                isSelected={selectedId === task.id}
                                onClick={() => onSelect(task.id)}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    </div>
);

export default function V2Tasks() {
    const { data: tasks = [], isLoading } = useTasks();
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedTaskId && tasks.length > 0) {
            setSelectedTaskId(tasks[0].id);
        }
    }, [tasks, selectedTaskId]);

    // Mock toggle for now (real update would use mutation)
    const handleToggle = (id) => {
        // In a real app, call mutation here
        console.log("Toggle task", id);
    };

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading tasks...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <TasksListContent
                        tasks={tasks}
                        selectedId={selectedTaskId || (tasks[0]?.id)}
                        onSelect={setSelectedTaskId}
                        onToggle={handleToggle}
                    />
                }
                secondaryContent={
                    <V2TaskDetail task={selectedTask} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
