import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Unified AI Service that supports multiple providers
 * OpenAI, Anthropic Claude, Google Gemini, and Ollama
 */
class AIService {
  constructor() {
    this.providers = {
      openai: null,
      anthropic: null,
      google: null,
      ollama: null
    };

    this.initializeProviders();
  }

  initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI provider initialized');
    }

    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      console.log('✅ Anthropic provider initialized');
    }

    // Google Gemini
    if (process.env.GOOGLE_API_KEY) {
      this.providers.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      console.log('✅ Google Gemini provider initialized');
    }

    // Ollama (local)
    if (process.env.OLLAMA_BASE_URL) {
      this.providers.ollama = {
        baseUrl: process.env.OLLAMA_BASE_URL
      };
      console.log('✅ Ollama provider configured');
    }
  }

  /**
   * Generate text completion with the specified provider
   */
  async chat(messages, options = {}) {
    const {
      provider = process.env.DEFAULT_AI_PROVIDER || 'openai',
      model = process.env.DEFAULT_MODEL,
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    switch (provider) {
      case 'openai':
        return await this.chatOpenAI(messages, { model, temperature, maxTokens });

      case 'anthropic':
        return await this.chatAnthropic(messages, { model, temperature, maxTokens });

      case 'google':
        return await this.chatGoogle(messages, { model, temperature, maxTokens });

      case 'ollama':
        return await this.chatOllama(messages, { model, temperature, maxTokens });

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  async chatOpenAI(messages, { model = 'gpt-4-turbo-preview', temperature, maxTokens }) {
    if (!this.providers.openai) {
      throw new Error('OpenAI provider not initialized. Check OPENAI_API_KEY');
    }

    const response = await this.providers.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage,
      model: response.model
    };
  }

  async chatAnthropic(messages, { model = 'claude-3-opus-20240229', temperature, maxTokens }) {
    if (!this.providers.anthropic) {
      throw new Error('Anthropic provider not initialized. Check ANTHROPIC_API_KEY');
    }

    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.providers.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemMessage?.content,
      messages: userMessages
    });

    return {
      content: response.content[0].text,
      usage: response.usage,
      model: response.model
    };
  }

  async chatGoogle(messages, { model = 'gemini-pro', temperature, maxTokens }) {
    if (!this.providers.google) {
      throw new Error('Google provider not initialized. Check GOOGLE_API_KEY');
    }

    const genAI = this.providers.google.getGenerativeModel({ model });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = genAI.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;

    return {
      content: response.text(),
      usage: null, // Gemini doesn't provide usage in the same way
      model
    };
  }

  async chatOllama(messages, { model = 'llama2', temperature, maxTokens }) {
    if (!this.providers.ollama) {
      throw new Error('Ollama provider not configured. Check OLLAMA_BASE_URL');
    }

    const response = await fetch(`${this.providers.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      usage: null,
      model: data.model
    };
  }

  /**
   * Generate structured learning plan
   */
  async generateLearningPlan(userContext) {
    const systemPrompt = `You are an expert learning coach. Generate a personalized learning plan based on the user's context.

Return a JSON object with this structure:
{
  "title": "string",
  "description": "string",
  "estimatedHours": number,
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "order": number,
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "type": "practice|project|reading|video|exercise",
          "estimatedMinutes": number,
          "difficulty": "easy|medium|hard",
          "resources": [{"title": "string", "url": "string"}]
        }
      ]
    }
  ],
  "recommendations": "string - additional tips for success"
}`;

    const userPrompt = `Create a learning plan for:
Subject: ${userContext.subject}
Goal: ${userContext.goal}
Current Level: ${userContext.currentLevel || 'beginner'}
Available Time: ${userContext.hoursPerWeek || 10} hours/week
Duration: ${userContext.durationWeeks || 8} weeks
Learning Style: ${userContext.learningStyle || 'mixed'}
${userContext.additionalInfo ? `Additional Info: ${userContext.additionalInfo}` : ''}

Focus on actionable, measurable tasks that reduce learning friction.`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.8,
      maxTokens: 3000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // If JSON parsing fails, return a structured error
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('AI generated invalid plan format. Please try again.');
    }
  }

  /**
   * Analyze learning progress and provide insights
   */
  async analyzeProgress(progressData) {
    const systemPrompt = `You are a learning analytics expert. Analyze the user's progress and provide actionable insights.`;

    const userPrompt = `Analyze this learning data:

Completed Tasks: ${progressData.completedTasks}
Pending Tasks: ${progressData.pendingTasks}
Current Streak: ${progressData.streak} days
Total Study Time: ${progressData.totalMinutes} minutes
Recent Blockers: ${JSON.stringify(progressData.blockers || [])}

Provide:
1. Progress assessment (1-2 sentences)
2. Identified patterns or concerns
3. 2-3 specific actionable recommendations
4. Encouragement based on their state

Format as JSON:
{
  "assessment": "string",
  "patterns": ["string"],
  "recommendations": ["string"],
  "encouragement": "string"
}`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 1000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse progress analysis:', error);
      return {
        assessment: response.content,
        patterns: [],
        recommendations: [],
        encouragement: 'Keep going! Every step counts.'
      };
    }
  }

  /**
   * Suggest next best action based on current state
   */
  async suggestNextAction(context) {
    const systemPrompt = `You are a learning coach. Suggest the single best next action to reduce friction and maintain momentum.`;

    const userPrompt = `Current situation:
Current Task: ${context.currentTask || 'none'}
Energy Level: ${context.energyLevel || 'medium'}
Available Time: ${context.availableMinutes || 30} minutes
Recent Progress: ${context.recentProgress || 'normal'}
Blockers: ${context.blockers || 'none'}

Suggest ONE specific action they can take RIGHT NOW. Be concise and actionable.

Format as JSON:
{
  "action": "string - the specific action",
  "reasoning": "string - why this action now",
  "estimatedMinutes": number,
  "difficulty": "easy|medium|hard"
}`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      maxTokens: 500
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to parse next action:', error);
      return {
        action: 'Review your learning plan and pick the next uncompleted task',
        reasoning: 'Starting with clarity helps reduce friction',
        estimatedMinutes: 20,
        difficulty: 'easy'
      };
    }
  }
}

// Singleton instance
const aiService = new AIService();

export default aiService;
