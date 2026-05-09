import { JobInfo, MatchInfo } from './types';

const COMMON_RULES = `
- CRITICAL: DO NOT use em-dashes (— or -) under any circumstances. Use commas or semicolons instead.
- CRITICAL: DO NOT use the rhetorical structure "I didn't just [do X]... I also [did Y]".
- CRITICAL: DO NOT use filler corporate-speak ("leveraged", "utilized", "synergized").
- CRITICAL: Write like a real person, not an AI. Avoid cliches.
`;

export const getExtractJobInfoPrompt = (description: string) => `
Extract the following information from the job description:
- role (Job Title)
- company (Company Name)
- skills (Array of core technical and soft skills required)
- responsibilities (One concise paragraph summarizing the primary responsibilities)

Return ONLY a JSON object with keys: role, company, skills (array of strings), responsibilities.

Job Description:
${description}
`;

export const getMatchProfilePrompt = (profile: string, jobInfo: JobInfo) => `
Given the candidate's profile and extracted job info, identify the most relevant experiences and skills.

Return ONLY a JSON object with:
- relevant_experience (array of strings — specific achievements from the profile that map to the role)
- relevant_skills (array of strings — skills from the profile that directly match what's needed)

Profile:
${profile}

Job Info:
${JSON.stringify(jobInfo)}
`;

export const getGenerateResumePrompt = (profile: string, jobInfo: JobInfo, matchInfo: MatchInfo) => `
You are an expert resume strategist. Your job is to rewrite a candidate's resume to be perfectly tailored for a specific role without inventing anything.

CANDIDATE PROFILE:
${profile}

TARGET ROLE: ${jobInfo.role || 'the role'} at ${jobInfo.company || 'the company'}
JOB REQUIREMENTS: ${JSON.stringify(jobInfo)}
MATCHED STRENGTHS: ${JSON.stringify(matchInfo)}

RULES:
- CRITICAL: The entire output MUST be extremely concise to fit on one printed page. MAXIMUM 3 bullet points per experience. MAXIMUM 4 skills per category. MAXIMUM 350 words total.
- DO NOT fabricate experience, companies, or roles
- Rewrite bullet points to quantify impact where evidence of numbers exists in the profile
- The summary MUST be written specifically for the role of "${jobInfo.role}" - make it targeted, confident, and human
- Under skillCategories: only include skills actually in the profile that are relevant to this job. Group them logically by category (e.g., "AI & Machine Learning", "DevOps & Cloud", "Languages")
- Each category should have 3 to 7 skills maximum
- Bullet points should start with strong, specific action verbs (built, designed, reduced, shipped) - not vague ones
${COMMON_RULES}

Output a JSON object:
{
  "name": "string",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional URL)",
    "github": "string (optional URL)",
    "portfolio": "string (optional URL)",
    "website": "string (optional URL)"
  },
  "summary": "string — 2 to 3 sentences. Targeted to ${jobInfo.role}. Don't open with 'I am'. Make it punchy and specific.",
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
      "bullets": ["string - specific, quantified when possible, strong verbs"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "tech": "string",
      "link": "string (optional URL)",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "date": "string"
    }
  ],
  "customSections": [
    {
      "title": "string",
      "content": "string - formatting preserved"
    }
  ]
}

Return ONLY valid JSON. No markdown fences. No explanation.
`;

export const getGenerateCoverLetterPrompt = (profile: string, jobInfo: JobInfo) => {
  const date = new Date().toISOString().split('T')[0];
  return `
You are a writing coach helping a real candidate write an unforgettable cover letter for a ${jobInfo.role || 'role'} position at ${jobInfo.company || 'the company'}.

RULES:
- DO NOT open with "I am writing to apply for..." or any variation of that tired opener
- DO NOT open with "Dear Hiring Manager" - that's handled elsewhere
- Write in flowing, confident prose - think op-ed, not form letter
- Open mid-thought, with something compelling about the work, the problem space, or a specific connection to the role
- Do NOT bullet point anything - this is prose
- 2 to 4 paragraphs. Tight. Specific. Human.
- Reference actual experiences from the profile - no vague generalities
- Tie the candidate's actual background to what the role specifically needs
- Show genuine enthusiasm without being sycophantic
- Voice: first-person, direct, confident
${COMMON_RULES}

CANDIDATE PROFILE:
${profile}

JOB INFO:
${JSON.stringify(jobInfo)}

Output a JSON object:
{
  "name": "string",
  "contact": { "email": "string", "phone": "string", "location": "string" },
  "date": "string - today's date, formatted like April 7, 2026",
  "company": "string",
  "role": "string",
  "body": "string - the prose body only. No salutation. No closing. Just the 2 to 4 paragraph body. Newlines between paragraphs."
}

STRICT: ensure accurate date. Today is ${date}.
Return ONLY valid JSON. No markdown. No extra text.
`;
};

export const getGenerateAnswersPrompt = (profile: string, jobInfo: JobInfo, questions: string[]) => `
You're helping a candidate answer specific application questions for a ${jobInfo.role || 'role'} at ${jobInfo.company || 'a company'}.

RULES:
- Answer EACH question specifically and directly - don't deflect or be vague
- Write in first person, genuine voice - like you're actually the candidate, not a robot
- Pull specific examples from the candidate's profile - name actual projects, companies, accomplishments
- Avoid clichés: "I am passionate about...", "I've always loved...", "I'm a team player"
- Be honest and specific. Confidence without arrogance.
- Each answer should be 2 to 5 sentences, substantive but not rambling
- Format your response clearly: label each question before the answer
${COMMON_RULES}

QUESTIONS TO ANSWER:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

CANDIDATE PROFILE:
${profile}

JOB INFO:
${JSON.stringify(jobInfo)}

Write ALL answers, one after the other. Label each with the original question number and text.
`;

export const getExpandSearchTermsPrompt = (terms: string) => `
Given the following job search terms, return an expanded array of similar and highly relevant job titles or keywords.
For example, if given "Software Engineer", you might return ["Software Engineer", "Developer", "Programmer", "SWE", "Software Developer"].
If the terms are empty or generic, return generic tech roles.

Original Terms: ${terms || "Tech jobs"}

Return ONLY a JSON object with a single key "terms" containing an array of strings. No explanations.
`;

export const getExtractProfilePrompt = (text: string) => `
Extract the following candidate information from the provided resume text into a strictly formatted JSON object.

Return ONLY a JSON object with this exact structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string (extract full URL, if only username/handle present then construct the full URL)",
  "github": "string (extract full URL, if only username/handle present then construct the full URL)",
  "portfolio": "string (extract full URL or domain)",
  "summary": "string",
  "experience": [{ "title": "string", "company": "string", "startDate": "string", "endDate": "string", "bullets": "string (all bullets combined with newlines)" }],
  "skills": [{ "category": "string", "skills": "string (comma separated list)" }],
  "projects": [{ "name": "string", "tech": "string", "link": "string (extract full URL if available)", "bullets": "string (all bullets combined with newlines)" }],
  "education": [{ "institution": "string", "degree": "string", "date": "string" }]
}

Text:
${text}
`;
