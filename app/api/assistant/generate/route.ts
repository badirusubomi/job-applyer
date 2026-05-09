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

    // Step 3: Run requested actions concurrently
    const resumeTask = actions.resume ? aiProvider.generateResume(profile, jobInfo, matchInfo) : Promise.resolve('');
    const coverLetterTask = actions.coverLetter ? aiProvider.generateCoverLetter(profile, jobInfo, clTemplate) : Promise.resolve('');
    
    let answersTask = Promise.resolve('');
    if (actions.answers) {
      const questionsToUse = Array.isArray(rawQuestions) && rawQuestions.length > 0
        ? rawQuestions
        : [
            "Why do you want this role?",
            "What makes you a strong fit for this position?",
            "Describe a technical challenge you solved and how."
          ];
      answersTask = aiProvider.generateAnswers(profile, jobInfo, questionsToUse);
    }

    const [resume, coverLetter, answers] = await Promise.all([resumeTask, coverLetterTask, answersTask]);

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
