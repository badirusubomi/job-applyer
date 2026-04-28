import OpenAI from 'openai';
import { AIProvider, JobInfo, MatchInfo } from '../types';

const MODEL = 'gpt-4o-mini';

export const createOpenAIProvider = (apiKey?: string): AIProvider => {
  const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy_key_for_build' });

  return {
  async extractJobInfo(description: string): Promise<JobInfo> {
    const prompt = `
Extract the following information from the job description:
- role (Job Title)
- company (Company Name)
- skills (Array of core technical and soft skills required)
- responsibilities (One concise paragraph summarizing the primary responsibilities)

Return ONLY a JSON object with keys: role, company, skills (array of strings), responsibilities.

Job Description:
${description}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async matchProfile(profile: string, jobInfo: JobInfo): Promise<MatchInfo> {
    const prompt = `
Given the candidate's profile and extracted job info, identify the most relevant experiences and skills.

Return ONLY a JSON object with:
- relevant_experience (array of strings — specific achievements from the profile that map to the role)
- relevant_skills (array of strings — skills from the profile that directly match what's needed)

Profile:
${profile}

Job Info:
${JSON.stringify(jobInfo)}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  },

  async generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo): Promise<string> {
    const prompt = `
You are an expert resume strategist. Your job is to rewrite a candidate's resume to be perfectly tailored for a specific role — without inventing anything.

CANDIDATE PROFILE:
${profile}

TARGET ROLE: ${jobInfo.role || 'the role'} at ${jobInfo.company || 'the company'}
JOB REQUIREMENTS: ${JSON.stringify(jobInfo)}
MATCHED STRENGTHS: ${JSON.stringify(matchInfo)}

RULES:
- DO NOT fabricate experience, companies, or roles
- DO NOT use filler corporate-speak ("leveraged", "utilized", "synergized") — write like a real person
- Rewrite bullet points to quantify impact where evidence of numbers exists in the profile
- The summary MUST be written specifically for the role of "${jobInfo.role}" — make it targeted, confident, and human
- Under skillCategories: only include skills actually in the profile that are relevant to this job. Group them logically by category (e.g., "AI & Machine Learning", "DevOps & Cloud", "Languages")
- Each category should have 3–7 skills maximum
- Bullet points should start with strong, specific action verbs (built, designed, reduced, shipped) — not vague ones

Output a JSON object:
{
  "name": "string",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string"
  },
  "summary": "string — 2–3 sentences. Targeted to ${jobInfo.role}. Don't open with 'I am'. Make it punchy and specific.",
  "skillCategories": [
    {
      "category": "string",
      "skills": ["string"]
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string — specific, quantified when possible, strong verbs"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "tech": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "date": "string"
    }
  ]
}

Return ONLY valid JSON. No markdown fences. No explanation.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '{}';
  },

  async generateCoverLetter(profile: string, jobInfo: JobInfo, template: string): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const prompt = `
You are a writing coach helping a real candidate write an unforgettable cover letter for a ${jobInfo.role || 'role'} position at ${jobInfo.company || 'the company'}.

RULES — CRITICAL:
- DO NOT open with "I am writing to apply for..." or any variation of that tired opener
- DO NOT open with "Dear Hiring Manager" — that's handled elsewhere
- Write in flowing, confident prose — think op-ed, not form letter
- Open mid-thought, with something compelling about the work, the problem space, or a specific connection to the role
- Do NOT bullet point anything — this is prose
- 2–4 paragraphs. Tight. Specific. Human.
- Reference actual experiences from the profile — no vague generalities
- Tie the candidate's actual background to what the role specifically needs
- Show genuine enthusiasm without being sycophantic
- Voice: first-person, direct, confident

CANDIDATE PROFILE:
${profile}

JOB INFO:
${JSON.stringify(jobInfo)}

Output a JSON object:
{
  "name": "string",
  "contact": { "email": "string", "phone": "string", "location": "string" },
  "date": "string — today's date, formatted like April 7, 2026",
  "company": "string",
  "role": "string",
  "body": "string — the prose body only. No salutation. No closing. Just the 2–4 paragraph body. Newlines between paragraphs."
}
STRICT: ensure accurate date. Today is ${date}.
Return ONLY valid JSON. No markdown. No extra text.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '{}';
  },

  async generateAnswers(profile: string, jobInfo: JobInfo, questions: string[]): Promise<string> {
    const prompt = `
You're helping a candidate answer specific application questions for a ${jobInfo.role || 'role'} at ${jobInfo.company || 'a company'}.

RULES:
- Answer EACH question specifically and directly — don't deflect or be vague
- Write in first person, genuine voice — like you're actually the candidate, not a robot
- Pull specific examples from the candidate's profile — name actual projects, companies, accomplishments
- Avoid clichés: "I am passionate about...", "I've always loved...", "I'm a team player"
- Be honest and specific. Confidence without arrogance.
- Each answer should be 2–5 sentences, substantive but not rambling
- Format your response clearly: label each question before the answer

QUESTIONS TO ANSWER:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

CANDIDATE PROFILE:
${profile}

JOB INFO:
${JSON.stringify(jobInfo)}

Write ALL answers, one after the other. Label each with the original question number and text.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content || '';
  },

  async expandSearchTerms(terms: string): Promise<string[]> {
    const prompt = `
Given the following job search terms, return an expanded array of similar and highly relevant job titles or keywords.
For example, if given "Software Engineer", you might return ["Software Engineer", "Developer", "Programmer", "SWE", "Software Developer"].
If the terms are empty or generic, return generic tech roles.

Original Terms: ${terms || "Tech jobs"}

Return ONLY a JSON object with a single key "terms" containing an array of strings. No explanations.
    `;

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
  }
  };
};
