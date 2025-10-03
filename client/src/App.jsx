import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import PlanGenerator from './pages/PlanGenerator';
import TaskManager from './pages/TaskManager';
import PomodoroTimer from './components/PomodoroTimer';
import { Brain, Target, ListTodo, Timer } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userId] = useState('demo-user'); // In production, use real auth

  const views = {
    dashboard: { component: Dashboard, icon: Brain, label: 'Dashboard' },
    generator: { component: PlanGenerator, icon: Target, label: 'Generate Plan' },
    tasks: { component: TaskManager, icon: ListTodo, label: 'Tasks' },
  };

  const CurrentView = views[currentView].component;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Learning Assistant
                </h1>
              </div>

              <nav className="flex space-x-2">
                {Object.entries(views).map(([key, { icon: Icon, label }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentView === key
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CurrentView userId={userId} />
        </main>

        {/* Floating Pomodoro */}
        <div className="fixed bottom-6 right-6">
          <PomodoroTimer userId={userId} />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
