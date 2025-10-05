import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAPI, plansAPI } from '../services/api';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

// Constants
const MIN_HOURS_PER_WEEK = 1;
const MAX_HOURS_PER_WEEK = 40;
const MIN_DURATION_WEEKS = 1;
const MAX_DURATION_WEEKS = 52;
const DEFAULT_HOURS_PER_WEEK = 10;
const DEFAULT_DURATION_WEEKS = 8;

const INITIAL_FORM_DATA = {
  subject: '',
  goal: '',
  currentLevel: 'beginner',
  hoursPerWeek: DEFAULT_HOURS_PER_WEEK,
  durationWeeks: DEFAULT_DURATION_WEEKS,
  learningStyle: 'mixed',
  additionalInfo: '',
};

export default function PlanGenerator({ userId }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generatePlan(data),
    onError: (error) => {
      toast.error(`Failed to generate plan: ${error.message}`);
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: (data) => plansAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plans']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('🎉 Learning plan created successfully!');
      setFormData(INITIAL_FORM_DATA);
    },
    onError: (error) => {
      toast.error(`Failed to save plan: ${error.message}`);
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const loadingToast = toast.loading('🤖 AI is generating your learning plan...');

      try {
        const response = await generateMutation.mutateAsync(formData);
        const generatedPlan = response.data.plan;

        // Save to database
        await savePlanMutation.mutateAsync({
          userId,
          title: generatedPlan.title,
          subject: formData.subject,
          description: generatedPlan.description,
          difficulty: formData.currentLevel,
          aiGenerated: true,
          estimatedHours: generatedPlan.estimatedHours,
          userContext: formData,
          milestones: generatedPlan.milestones,
        });

        toast.dismiss(loadingToast);
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error generating plan:', error);
      }
    },
    [formData, userId, generateMutation, savePlanMutation]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const isLoading = generateMutation.isPending || savePlanMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" aria-hidden="true" />
          Generate Learning Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let AI create a personalized learning roadmap for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4" aria-label="Learning plan generator form">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What do you want to learn? *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Python Programming, Spanish, Data Science"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What&apos;s your goal? *
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="e.g., Build web applications, Pass IELTS exam, Become a data analyst"
            required
            aria-required="true"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Level
            </label>
            <select
              id="currentLevel"
              name="currentLevel"
              value={formData.currentLevel}
              onChange={handleChange}
              className="input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Style
            </label>
            <select
              id="learningStyle"
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
              className="input"
            >
              <option value="visual">Visual</option>
              <option value="reading">Reading/Writing</option>
              <option value="hands-on">Hands-on</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours per Week
            </label>
            <input
              type="number"
              id="hoursPerWeek"
              name="hoursPerWeek"
              value={formData.hoursPerWeek}
              onChange={handleChange}
              className="input"
              min={MIN_HOURS_PER_WEEK}
              max={MAX_HOURS_PER_WEEK}
              aria-describedby="hoursPerWeekHelp"
            />
            <p id="hoursPerWeekHelp" className="sr-only">
              Enter hours between {MIN_HOURS_PER_WEEK} and {MAX_HOURS_PER_WEEK}
            </p>
          </div>

          <div>
            <label htmlFor="durationWeeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (weeks)
            </label>
            <input
              type="number"
              id="durationWeeks"
              name="durationWeeks"
              value={formData.durationWeeks}
              onChange={handleChange}
              className="input"
              min={MIN_DURATION_WEEKS}
              max={MAX_DURATION_WEEKS}
              aria-describedby="durationWeeksHelp"
            />
            <p id="durationWeeksHelp" className="sr-only">
              Enter duration between {MIN_DURATION_WEEKS} and {MAX_DURATION_WEEKS} weeks
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Any specific preferences, constraints, or topics you want to focus on"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          aria-label={isLoading ? 'Generating learning plan' : 'Generate learning plan'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Generate Learning Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}

PlanGenerator.propTypes = {
  userId: PropTypes.string.isRequired,
};
