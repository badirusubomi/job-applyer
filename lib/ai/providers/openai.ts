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

const MODEL = 'gpt-4o-mini';

export const createOpenAIProvider = (apiKey?: string): AIProvider => {
  const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy_key_for_build' });

  return {
    async extractJobInfo(description: string): Promise<JobInfo> {
      const prompt = getExtractJobInfoPrompt(description);
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    },

    async matchProfile(profile: string, jobInfo: JobInfo): Promise<MatchInfo> {
      const prompt = getMatchProfilePrompt(profile, jobInfo);
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    },

    async generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo): Promise<string> {
      const prompt = getGenerateResumePrompt(profile, jobInfo, matchInfo);
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return response.choices[0].message.content || '{}';
    },

    async generateCoverLetter(profile: string, jobInfo: JobInfo, template: string): Promise<string> {
      const prompt = getGenerateCoverLetterPrompt(profile, jobInfo);
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return response.choices[0].message.content || '{}';
    },

    async generateAnswers(profile: string, jobInfo: JobInfo, questions: string[]): Promise<string> {
      const prompt = getGenerateAnswersPrompt(profile, jobInfo, questions);
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content || '';
    },

    async expandSearchTerms(terms: string): Promise<string[]> {
      const prompt = getExpandSearchTermsPrompt(terms);
      const response = await openai.chat.completions.create({
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
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    }
  };
};
