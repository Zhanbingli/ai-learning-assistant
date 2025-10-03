import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { sessionsAPI } from '../services/api';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function PomodoroTimer({ userId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const startSessionMutation = useMutation({
    mutationFn: (data) => sessionsAPI.start(data),
  });

  const completeSessionMutation = useMutation({
    mutationFn: ({ id, data }) => sessionsAPI.complete(id, data),
  });

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);

    if (!isBreak && sessionId) {
      // Complete pomodoro session
      await completeSessionMutation.mutateAsync({
        id: sessionId,
        data: { focusScore: 8 },
      });
      setSessionId(null);
    }

    // Switch mode
    setIsBreak(!isBreak);
    setTimeLeft((isBreak ? POMODORO_MINUTES : BREAK_MINUTES) * 60);
  };

  const handleStart = async () => {
    if (!isBreak && !sessionId) {
      // Start new pomodoro session
      const response = await startSessionMutation.mutateAsync({
        userId,
        type: 'pomodoro',
      });
      setSessionId(response.data.session.id);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(POMODORO_MINUTES * 60);
    setSessionId(null);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all"
      >
        <Timer className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn btn-primary flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn btn-primary flex items-center gap-2"
          >
            <Pause className="w-5 h-5" />
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {isRunning && !isBreak && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay focused! 💪
          </p>
        </div>
      )}
    </div>
  );
}
