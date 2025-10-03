import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { TrendingUp, CheckCircle, Clock, Flame } from 'lucide-react';

export default function Dashboard({ userId }) {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics', 'overview', userId],
    queryFn: () => analyticsAPI.overview(userId).then(res => res.data.overview),
  });

  const { data: streaks } = useQuery({
    queryKey: ['analytics', 'streaks', userId],
    queryFn: () => analyticsAPI.streaks(userId).then(res => res.data.streaks),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Plans',
      value: overview?.activePlans || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Completed Tasks',
      value: overview?.completedTasks || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Total Hours',
      value: ((overview?.totalMinutes || 0) / 60).toFixed(1),
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Current Streak',
      value: `${streaks?.current || 0} days`,
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <h3 className="text-xl font-bold mb-2">Welcome back! 👋</h3>
        <p className="opacity-90">
          You've completed {overview?.completedTasks || 0} tasks and maintained a{' '}
          {streaks?.current || 0}-day streak. Keep up the great work!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-primary text-left">
            Start a Study Session
          </button>
          <button className="btn btn-secondary text-left">
            Create New Task
          </button>
          <button className="btn btn-secondary text-left">
            Generate Learning Plan
          </button>
        </div>
      </div>
    </div>
  );
}
