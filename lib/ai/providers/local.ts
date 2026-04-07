import OpenAI from 'openai';
import { AIProvider, JobInfo, MatchInfo } from '../types';

// Connect to a local OpenAI-compatible endpoint like Ollama (http://localhost:11434/v1)
const localAI = new OpenAI({ 
  baseURL: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
  apiKey: 'dummy_key_not_needed_for_local' 
});

export const LocalProvider: AIProvider = {
  async extractJobInfo(description: string): Promise<JobInfo> {
    const prompt = `
Extract the following information from the job description:
- role (Job Title)
- company (Company Name)
- skills (List of comma-separated core skills)
- responsibilities (Short summary of primary responsibilities)

Return ONLY a JSON object with keys: role, company, skills, responsibilities.

Job Description:
${description}
    `;

    const response = await localAI.chat.completions.create({
      model: process.env.LOCAL_LLM_MODEL || 'llama3', // default fallback
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  },

  async matchProfile(profile: string, jobInfo: JobInfo): Promise<MatchInfo> {
    const prompt = `
Given the user's profile and the extracted job info, determine the most relevant experience and skills from the profile that match the job.

Return ONLY a JSON object with keys: 
- relevant_experience (array of strings, summarizing matching experiences)
- relevant_skills (array of strings)

Profile:
${profile}

Job Info:
${JSON.stringify(jobInfo)}
    `;

    const response = await localAI.chat.completions.create({
      model: process.env.LOCAL_LLM_MODEL || 'llama3',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content || '{}';
    return JSON.parse(content);
  },

  async generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo): Promise<string> {
    const prompt = `
Act as an expert resume writer.

CONSTRAINTS (VERY IMPORTANT):
- DO NOT fabricate experience
- DO NOT add new roles not found in the profile
- ONLY rewrite existing bullet points to better match the job description
- KEEP formatting consistent (Markdown)
- KEEP bullet points concise

Profile:
${profile}

Job Info:
${JSON.stringify(jobInfo)}

Matched Info:
${JSON.stringify(matchInfo)}

Output the tailored resume in Markdown.
    `;

    const response = await localAI.chat.completions.create({
      model: process.env.LOCAL_LLM_MODEL || 'llama3',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content || '';
  },

  async generateCoverLetter(profile: string, jobInfo: JobInfo, template: string): Promise<string> {
    const prompt = `
Generate a tailored cover letter using the following template.

Replace placeholders:
{{company}} -> ${jobInfo.company || 'the company'}
{{role}} -> ${jobInfo.role || 'the role'}
{{custom_paragraph}} -> Write a custom paragraph explaining why the candidate is a great fit based on the Profile.

Template:
${template}

Profile:
${profile}

Return the completed cover letter in Markdown.
    `;

    const response = await localAI.chat.completions.create({
      model: process.env.LOCAL_LLM_MODEL || 'llama3',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content || '';
  },

  async generateAnswers(profile: string, jobInfo: JobInfo, questions: string[]): Promise<string> {
    const prompt = `
Answer the following application questions based on the candidate's profile and the job info.

Questions:
${questions.join('\n')}

Job Info:
${JSON.stringify(jobInfo)}

Profile:
${profile}

Keep answers professional, concise, and focused on why the candidate is a good fit.
Return the answers clearly numbered.
    `;

    const response = await localAI.chat.completions.create({
      model: process.env.LOCAL_LLM_MODEL || 'llama3',
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content || '';
  }
};
