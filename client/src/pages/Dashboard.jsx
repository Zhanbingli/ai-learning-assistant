import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { TrendingUp, CheckCircle, Clock, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import StatCard from '../components/StatCard';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import ErrorMessage from '../components/ErrorMessage';

// Constants
const MINUTES_PER_HOUR = 60;
const DECIMAL_PLACES = 1;

const STATS_CONFIG = [
  {
    key: 'activePlans',
    label: 'Active Plans',
    icon: TrendingUp,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    key: 'completedTasks',
    label: 'Completed Tasks',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    key: 'totalHours',
    label: 'Total Hours',
    icon: Clock,
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
  },
  {
    key: 'currentStreak',
    label: 'Current Streak',
    icon: Flame,
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
  },
];

export default function Dashboard({ userId }) {
  const {
    data: overview,
    isLoading: isLoadingOverview,
    isError: isErrorOverview,
    error: errorOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['analytics', 'overview', userId],
    queryFn: () => analyticsAPI.overview(userId).then((res) => res.data.overview),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      toast.error(`Failed to load overview: ${err.message}`);
    },
  });

  const {
    data: streaks,
    isLoading: isLoadingStreaks,
    isError: isErrorStreaks,
  } = useQuery({
    queryKey: ['analytics', 'streaks', userId],
    queryFn: () => analyticsAPI.streaks(userId).then((res) => res.data.streaks),
    retry: 3,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      toast.error(`Failed to load streaks: ${err.message}`);
    },
  });

  // Loading state
  if (isLoadingOverview || isLoadingStreaks) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (isErrorOverview) {
    return (
      <ErrorMessage
        message={`Failed to load dashboard: ${errorOverview.message}`}
        onRetry={refetchOverview}
      />
    );
  }

  // Calculate stats values
  const stats = STATS_CONFIG.map((config) => {
    let value;

    switch (config.key) {
      case 'currentStreak':
        value = `${streaks?.current || 0} days`;
        break;
      case 'totalHours':
        value = ((overview?.totalMinutes || 0) / MINUTES_PER_HOUR).toFixed(DECIMAL_PLACES);
        break;
      default:
        value = overview?.[config.key] || 0;
    }

    return { ...config, value };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
          />
        ))}
      </div>

      {/* Welcome Message */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <h3 className="text-xl font-bold mb-2">Welcome back! 👋</h3>
        <p className="opacity-90">
          You&apos;ve completed {overview?.completedTasks || 0} tasks and maintained a{' '}
          {!isErrorStreaks && (streaks?.current || 0)}-day streak. Keep up the great work!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="btn btn-primary text-left"
            aria-label="Start a study session"
          >
            Start a Study Session
          </button>
          <button
            className="btn btn-secondary text-left"
            aria-label="Create new task"
          >
            Create New Task
          </button>
          <button
            className="btn btn-secondary text-left"
            aria-label="Generate learning plan"
          >
            Generate Learning Plan
          </button>
        </div>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  userId: PropTypes.string.isRequired,
};
