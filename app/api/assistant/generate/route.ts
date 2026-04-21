import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getProvider, AIModelType } from '@/lib/ai/index';

const profilePath = path.join(process.cwd(), 'data', 'profile.md');
const clTemplatePath = path.join(process.cwd(), 'templates', 'cover_letter_template.md');

export async function POST(req: Request) {
  try {
    const { jobDescription, actions, model, questions: rawQuestions, apiKey, profile } = await req.json();
    if (!jobDescription) return NextResponse.json({ error: 'Missing jobDescription' }, { status: 400 });
    if (!profile) return NextResponse.json({ error: 'Missing profile' }, { status: 400 });

    const selectedModel: AIModelType = model || 'openai';
    const aiProvider = getProvider(selectedModel, apiKey);

    const clTemplate = await fs.readFile(clTemplatePath, 'utf8').catch(() => '');

    // Step 1: Extract Job Info
    const jobInfo = await aiProvider.extractJobInfo(jobDescription);
    
    // Step 2: Match Profile
    const matchInfo = await aiProvider.matchProfile(profile, jobInfo);

    let resume = '';
    let coverLetter = '';
    let answers = '';

    // Step 3: Run requested actions
    if (actions.resume) {
      resume = await aiProvider.generateResume(profile, jobInfo, matchInfo);
    }
    
    if (actions.coverLetter) {
      coverLetter = await aiProvider.generateCoverLetter(profile, jobInfo, clTemplate);
    }

    if (actions.answers) {
      // Use user-supplied questions if provided, otherwise fall back to generic ones
      const questions: string[] = Array.isArray(rawQuestions) && rawQuestions.length > 0
        ? rawQuestions
        : [
            "Why do you want this role?",
            "What makes you a strong fit for this position?",
            "Describe a technical challenge you solved and how."
          ];
      answers = await aiProvider.generateAnswers(profile, jobInfo, questions);
    }

    return NextResponse.json({
      jobInfo,
      matchInfo,
      resume,
      coverLetter,
      answers
    });
  } catch (error: any) {
    console.error('Generation err:', error);
    return NextResponse.json({ error: 'Failed to generate output' }, { status: 500 });
  }
}
