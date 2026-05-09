import OpenAI from 'openai';
import { AIProvider, JobInfo, MatchInfo } from '../types';
import {
  getExtractJobInfoPrompt,
  getMatchProfilePrompt,
  getGenerateResumePrompt,
  getGenerateCoverLetterPrompt,
  getGenerateAnswersPrompt,
  getExpandSearchTermsPrompt,
  getExtractProfilePrompt
} from '../prompts';

const MODEL = process.env.LOCAL_LLM_MODEL || 'gemma4:e4b';

export const createLocalProvider = (baseUrl?: string): AIProvider => {
  const localAI = new OpenAI({
    baseURL: baseUrl || process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
    apiKey: 'ollama', // required field, not used for local
  });

  return {
    async extractJobInfo(description: string): Promise<JobInfo> {
      const prompt = getExtractJobInfoPrompt(description);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    },

    async matchProfile(profile: string, jobInfo: JobInfo): Promise<MatchInfo> {
      const prompt = getMatchProfilePrompt(profile, jobInfo);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    },

    async generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo): Promise<string> {
      const prompt = getGenerateResumePrompt(profile, jobInfo, matchInfo);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return response.choices[0].message.content || '{}';
    },

    async generateCoverLetter(profile: string, jobInfo: JobInfo, template: string): Promise<string> {
      const prompt = getGenerateCoverLetterPrompt(profile, jobInfo);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return response.choices[0].message.content || '{}';
    },

    async generateAnswers(profile: string, jobInfo: JobInfo, questions: string[]): Promise<string> {
      const prompt = getGenerateAnswersPrompt(profile, jobInfo, questions);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content || '';
    },

    async expandSearchTerms(terms: string): Promise<string[]> {
      const prompt = getExpandSearchTermsPrompt(terms);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      try {
        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        return parsed.terms || [];
      } catch {
        return [];
      }
    },

    async extractProfile(text: string): Promise<any> {
      const prompt = getExtractProfilePrompt(text);
      const response = await localAI.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    }
  };
};
