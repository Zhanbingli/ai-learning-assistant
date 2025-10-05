import { useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../services/api';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Constants
const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

export default function TaskManager({ userId }) {
  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => tasksAPI.list({ userId }).then((res) => res.data.tasks),
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (err) => {
      toast.error(`Failed to load tasks: ${err.message}`);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('✅ Task updated!');
    },
    onError: (err) => {
      toast.error(`Failed to update task: ${err.message}`);
    },
  });

  const handleToggleComplete = useCallback(
    (task) => {
      const newStatus =
        task.status === TASK_STATUSES.COMPLETED
          ? TASK_STATUSES.PENDING
          : TASK_STATUSES.COMPLETED;
      updateTaskMutation.mutate({
        id: task.id,
        data: { status: newStatus },
      });
    },
    [updateTaskMutation]
  );

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case TASK_STATUSES.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />;
      case TASK_STATUSES.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" aria-hidden="true" />;
      case TASK_STATUSES.BLOCKED:
        return <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" aria-hidden="true" />;
    }
  }, []);

  const groupedTasks = useMemo(
    () => ({
      pending: tasks?.filter((t) => t.status === TASK_STATUSES.PENDING) || [],
      in_progress: tasks?.filter((t) => t.status === TASK_STATUSES.IN_PROGRESS) || [],
      completed: tasks?.filter((t) => t.status === TASK_STATUSES.COMPLETED) || [],
    }),
    [tasks]
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-[400px]" />;
  }

  if (isError) {
    return <ErrorMessage message={`Failed to load tasks: ${error.message}`} onRetry={refetch} />;
  }

  const taskColumns = [
    {
      key: 'pending',
      title: 'Pending',
      tasks: groupedTasks.pending,
      emptyMessage: 'No pending tasks',
    },
    {
      key: 'in_progress',
      title: 'In Progress',
      tasks: groupedTasks.in_progress,
      emptyMessage: 'No tasks in progress',
    },
    {
      key: 'completed',
      title: 'Completed',
      tasks: groupedTasks.completed,
      emptyMessage: 'No completed tasks',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Task Manager</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {taskColumns.map((column) => (
          <div key={column.key} className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {column.title} ({column.tasks.length})
            </h3>
            <div
              className="space-y-2"
              role="list"
              aria-label={`${column.title} tasks`}
            >
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  getIcon={getStatusIcon}
                />
              ))}
              {column.tasks.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">{column.emptyMessage}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

TaskManager.propTypes = {
  userId: PropTypes.string.isRequired,
};

const TaskCard = memo(function TaskCard({ task, onToggle, getIcon }) {
  const isCompleted = task.status === TASK_STATUSES.COMPLETED;

  return (
    <div
      onClick={() => onToggle(task)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(task);
        }
      }}
      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      role="listitem"
      tabIndex={0}
      aria-label={`${task.title}, ${task.status}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon(task.status)}</div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium text-sm ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
            }`}
          >
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
});

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    estimatedMinutes: PropTypes.number,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  getIcon: PropTypes.func.isRequired,
};
