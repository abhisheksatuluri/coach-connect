import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, 
  Circle,
  Calendar, 
  Loader2, 
  AlertCircle,
  Clock,
  RotateCcw,
  ListTodo
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

export default function ClientTasksPage() {
  const [clientId, setClientId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedId = localStorage.getItem('viewingAsClientId');
    if (storedId) {
      setClientId(storedId);
    }
  }, []);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => base44.entities.Client.filter({ id: clientId }),
    enabled: !!clientId,
    select: (data) => data[0]
  });

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['client-tasks', clientId],
    queryFn: () => base44.entities.Action.filter({ 
      client_id: clientId,
      sentToClient: true
    }),
    enabled: !!clientId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Action.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    }
  });

  const handleToggleComplete = (action, complete) => {
    updateMutation.mutate({
      id: action.id,
      data: { 
        status: complete ? 'Done' : 'To Do',
        ...(complete && { appliedAt: new Date().toISOString() })
      }
    });
  };

  const pendingTasks = actions
    .filter(a => a.status === 'To Do' || a.status === 'In Progress')
    .sort((a, b) => {
      // Sort by priority first, then by due date
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const aPriority = priorityOrder[a.priority] ?? 1;
      const bPriority = priorityOrder[b.priority] ?? 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

  const completedTasks = actions
    .filter(a => a.status === 'Done')
    .sort((a, b) => new Date(b.appliedAt || b.updated_date) - new Date(a.appliedAt || a.updated_date));

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'Medium':
        return <Badge className="bg-amber-100 text-amber-700">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-blue-100 text-blue-700">Low</Badge>;
      default:
        return null;
    }
  };

  const getDueDateDisplay = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const overdue = isPast(date) && !isToday(date);
    const today = isToday(date);

    return (
      <div className={`flex items-center gap-1 text-sm ${
        overdue ? 'text-red-600' : today ? 'text-amber-600' : 'text-gray-500'
      }`}>
        <Calendar className="w-3 h-3" />
        <span>
          {overdue ? 'Overdue: ' : today ? 'Due today' : 'Due '}
          {!today && format(date, 'MMM d')}
        </span>
      </div>
    );
  };

  if (!clientId) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Client Selected</h2>
              <p className="text-gray-600">Please select a client from the dropdown in the header.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">
            Tasks assigned to you by your coach
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Tasks ({pendingTasks.length})
            </h2>
          </div>

          {pendingTasks.length === 0 ? (
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="py-8 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900">All caught up!</h3>
                <p className="text-gray-500 text-sm">No pending tasks right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  onToggle={(complete) => handleToggleComplete(task, complete)}
                  getPriorityBadge={getPriorityBadge}
                  getDueDateDisplay={getDueDateDisplay}
                  isUpdating={updateMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Completed ({completedTasks.length})
            </h2>
          </div>

          {completedTasks.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-8 text-center">
                <ListTodo className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No completed tasks yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedTasks.map(task => (
                <CompletedTaskCard 
                  key={task.id}
                  task={task}
                  onMarkIncomplete={() => handleToggleComplete(task, false)}
                  isUpdating={updateMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, getPriorityBadge, getDueDateDisplay, isUpdating }) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={false}
              onCheckedChange={(checked) => onToggle(checked)}
              disabled={isUpdating}
              className="h-5 w-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              {getPriorityBadge(task.priority)}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              {getDueDateDisplay(task.dueDate)}
              {task.actionType && (
                <Badge variant="outline" className="text-xs">
                  {task.actionType.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletedTaskCard({ task, onMarkIncomplete, isUpdating }) {
  return (
    <Card className="bg-gray-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-500 line-through">{task.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkIncomplete}
                disabled={isUpdating}
                className="text-gray-400 hover:text-gray-600 h-7 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Undo
              </Button>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                {task.description}
              </p>
            )}

            <p className="text-xs text-emerald-600 mt-2">
              Completed {format(new Date(task.appliedAt || task.updated_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}