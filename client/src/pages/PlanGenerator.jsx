import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiAPI, plansAPI } from '../services/api';
import { Sparkles, Loader2 } from 'lucide-react';

export default function PlanGenerator({ userId }) {
  const [formData, setFormData] = useState({
    subject: '',
    goal: '',
    currentLevel: 'beginner',
    hoursPerWeek: 10,
    durationWeeks: 8,
    learningStyle: 'mixed',
    additionalInfo: '',
  });

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generatePlan(data),
  });

  const savePlanMutation = useMutation({
    mutationFn: (data) => plansAPI.create(data),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      alert('Learning plan generated and saved successfully!');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          Generate Learning Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let AI create a personalized learning roadmap for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What do you want to learn? *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Python Programming, Spanish, Data Science"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What's your goal? *
          </label>
          <textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="e.g., Build web applications, Pass IELTS exam, Become a data analyst"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Level
            </label>
            <select name="currentLevel" value={formData.currentLevel} onChange={handleChange} className="input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Learning Style
            </label>
            <select name="learningStyle" value={formData.learningStyle} onChange={handleChange} className="input">
              <option value="visual">Visual</option>
              <option value="reading">Reading/Writing</option>
              <option value="hands-on">Hands-on</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours per Week
            </label>
            <input
              type="number"
              name="hoursPerWeek"
              value={formData.hoursPerWeek}
              onChange={handleChange}
              className="input"
              min="1"
              max="40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (weeks)
            </label>
            <input
              type="number"
              name="durationWeeks"
              value={formData.durationWeeks}
              onChange={handleChange}
              className="input"
              min="1"
              max="52"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Information
          </label>
          <textarea
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
          disabled={generateMutation.isPending || savePlanMutation.isPending}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {generateMutation.isPending || savePlanMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Learning Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
