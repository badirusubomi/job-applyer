import { GoogleGenAI } from '@google/genai';
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

const MODEL = 'gemini-2.5-flash';

export const createGeminiProvider = (apiKey?: string): AIProvider => {
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || 'dummy_key_for_build' });

  return {
    async extractJobInfo(description: string): Promise<JobInfo> {
      const prompt = getExtractJobInfoPrompt(description);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text || '{}');
    },

    async matchProfile(profile: string, jobInfo: JobInfo): Promise<MatchInfo> {
      const prompt = getMatchProfilePrompt(profile, jobInfo);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text || '{}');
    },

    async generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo): Promise<string> {
      const prompt = getGenerateResumePrompt(profile, jobInfo, matchInfo);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return response.text || '{}';
    },

    async generateCoverLetter(profile: string, jobInfo: JobInfo, template: string): Promise<string> {
      const prompt = getGenerateCoverLetterPrompt(profile, jobInfo);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return response.text || '{}';
    },

    async generateAnswers(profile: string, jobInfo: JobInfo, questions: string[]): Promise<string> {
      const prompt = getGenerateAnswersPrompt(profile, jobInfo, questions);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });
      return response.text || '';
    },

    async expandSearchTerms(terms: string): Promise<string[]> {
      const prompt = getExpandSearchTermsPrompt(terms);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      try {
        const parsed = JSON.parse(response.text || '{}');
        return parsed.terms || [];
      } catch {
        return [];
      }
    },

    async extractProfile(text: string): Promise<any> {
      const prompt = getExtractProfilePrompt(text);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text || '{}');
    }
  };
};
