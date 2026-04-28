export interface JobInfo {
  role?: string;
  company?: string;
  skills?: string[];
  responsibilities?: string;
  [key: string]: any;
}

export interface MatchInfo {
  relevant_experience?: string[];
  relevant_skills?: string[];
  [key: string]: any;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface AIProvider {
  extractJobInfo: (description: string) => Promise<JobInfo>;
  matchProfile: (profile: string, jobInfo: JobInfo) => Promise<MatchInfo>;
  generateResume: (profile: string, jobInfo: JobInfo, matchInfo: MatchInfo) => Promise<string>;
  generateCoverLetter: (profile: string, jobInfo: JobInfo, template: string) => Promise<string>;
  generateAnswers: (profile: string, jobInfo: JobInfo, questions: string[]) => Promise<string>;
  expandSearchTerms: (terms: string) => Promise<string[]>;
}
