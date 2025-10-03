import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../services/api';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

export default function TaskManager({ userId }) {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => tasksAPI.list({ userId }).then(res => res.data.tasks),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
    },
  });

  const handleToggleComplete = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus },
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const groupedTasks = {
    pending: tasks?.filter(t => t.status === 'pending') || [],
    in_progress: tasks?.filter(t => t.status === 'in_progress') || [],
    completed: tasks?.filter(t => t.status === 'completed') || [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Manager</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending ({groupedTasks.pending.length})
          </h3>
          <div className="space-y-2">
            {groupedTasks.pending.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                getIcon={getStatusIcon}
              />
            ))}
            {groupedTasks.pending.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No pending tasks</p>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            In Progress ({groupedTasks.in_progress.length})
          </h3>
          <div className="space-y-2">
            {groupedTasks.in_progress.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                getIcon={getStatusIcon}
              />
            ))}
            {groupedTasks.in_progress.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed ({groupedTasks.completed.length})
          </h3>
          <div className="space-y-2">
            {groupedTasks.completed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                getIcon={getStatusIcon}
              />
            ))}
            {groupedTasks.completed.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No completed tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, getIcon }) {
  return (
    <div
      onClick={() => onToggle(task)}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon(task.status)}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${
            task.status === 'completed'
              ? 'line-through text-gray-500'
              : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.estimatedMinutes && (
            <p className="text-xs text-gray-500 mt-1">
              ⏱️ {task.estimatedMinutes}min
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
