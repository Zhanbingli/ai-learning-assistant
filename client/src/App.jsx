import { useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PomodoroTimer from './components/PomodoroTimer';
import { Brain, Target, ListTodo } from 'lucide-react';
import PropTypes from 'prop-types';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlanGenerator = lazy(() => import('./pages/PlanGenerator'));
const TaskManager = lazy(() => import('./pages/TaskManager'));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Navigation button component
function NavButton({ isActive, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

NavButton.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

// Views configuration
const VIEWS = {
  dashboard: { component: Dashboard, icon: Brain, label: 'Dashboard' },
  generator: { component: PlanGenerator, icon: Target, label: 'Generate Plan' },
  tasks: { component: TaskManager, icon: ListTodo, label: 'Tasks' },
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userId] = useState('demo-user'); // In production, use real auth

  const CurrentView = VIEWS[currentView].component;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm" role="banner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8 text-primary-600" aria-hidden="true" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AI Learning Assistant
                  </h1>
                </div>

                <nav className="flex space-x-2" role="navigation" aria-label="Main navigation">
                  {Object.entries(VIEWS).map(([key, { icon, label }]) => (
                    <NavButton
                      key={key}
                      isActive={currentView === key}
                      onClick={() => setCurrentView(key)}
                      icon={icon}
                      label={label}
                    />
                  ))}
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
            <Suspense fallback={<LoadingSpinner size="lg" className="min-h-[400px]" />}>
              <CurrentView userId={userId} />
            </Suspense>
          </main>

          {/* Floating Pomodoro */}
          <div className="fixed bottom-6 right-6" role="complementary" aria-label="Pomodoro timer">
            <PomodoroTimer userId={userId} />
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #363636)',
              color: 'var(--toast-color, #fff)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
