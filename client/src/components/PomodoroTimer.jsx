import { useState, useEffect, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsAPI } from '../services/api';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 5;
const DEFAULT_FOCUS_SCORE = 8;

export default function PomodoroTimer({ userId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const queryClient = useQueryClient();

  const startSessionMutation = useMutation({
    mutationFn: (data) => sessionsAPI.start(data),
    onError: (error) => {
      toast.error(`Failed to start session: ${error.message}`);
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: ({ id, data }) => sessionsAPI.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['analytics']);
      toast.success('🎉 Pomodoro completed!');
    },
    onError: (error) => {
      toast.error(`Failed to complete session: ${error.message}`);
    },
  });

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);

    if (!isBreak && sessionId) {
      // Complete pomodoro session
      try {
        await completeSessionMutation.mutateAsync({
          id: sessionId,
          data: { focusScore: DEFAULT_FOCUS_SCORE },
        });
      } catch (error) {
        console.error('Error completing session:', error);
      }
      setSessionId(null);
    }

    // Switch mode
    setIsBreak((prev) => !prev);
    setTimeLeft((isBreak ? POMODORO_MINUTES : BREAK_MINUTES) * 60);

    // Notify user
    if (!isBreak) {
      toast.success('☕ Time for a break!');
    } else {
      toast.success('🍅 Back to focus!');
    }
  }, [isBreak, sessionId, completeSessionMutation]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  const handleStart = useCallback(async () => {
    if (!isBreak && !sessionId) {
      // Start new pomodoro session
      try {
        const response = await startSessionMutation.mutateAsync({
          userId,
          type: 'pomodoro',
        });
        setSessionId(response.data.session.id);
        toast.success('🍅 Pomodoro started!');
      } catch (error) {
        console.error('Error starting session:', error);
        return;
      }
    }
    setIsRunning(true);
  }, [isBreak, sessionId, userId, startSessionMutation]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    toast('⏸️ Paused', { icon: '⏸️' });
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(POMODORO_MINUTES * 60);
    setSessionId(null);
    toast('🔄 Timer reset', { icon: '🔄' });
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110"
        aria-label="Open Pomodoro Timer"
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
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-semibold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close timer"
        >
          ✕
        </button>
      </div>

      <div className="text-center mb-6">
        <div
          className="text-6xl font-bold text-gray-900 dark:text-white font-mono"
          aria-live="polite"
          aria-atomic="true"
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {isRunning ? 'Running...' : 'Paused'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn btn-primary flex items-center gap-2"
            disabled={startSessionMutation.isPending}
            aria-label="Start timer"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn btn-primary flex items-center gap-2"
            aria-label="Pause timer"
          >
            <Pause className="w-5 h-5" />
            Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="btn btn-secondary flex items-center gap-2"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {isRunning && !isBreak && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Stay focused! 💪</p>
        </div>
      )}

      {isRunning && isBreak && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Relax and recharge ☕</p>
        </div>
      )}
    </div>
  );
}

PomodoroTimer.propTypes = {
  userId: PropTypes.string.isRequired,
};
