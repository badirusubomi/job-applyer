# API Reference: JOB ASSIST Core Logic

This document describes the core AI integration logic present in `lib/ai.ts`.

## OpenAI Integration

JOB ASSIST uses OpenAI's `gpt-4o-mini` model by default. All calls are made via the `openai` client instance.

### `extractJobInfo(description: string)`

Extracts structured data from a raw job description string.

-   **Input**: `description` (Markdown or Plaintext).
-   **Output**: JSON object `{ role, company, skills, responsibilities }`.
-   **Notes**: Returns an empty object on failure.

### `matchProfile(profile: string, jobInfo: any)`

Compares the candidate's professional profile against the extracted job data.

-   **Inputs**:
    -   `profile`: User's profile in Markdown.
    -   `jobInfo`: Structured job data (from `extractJobInfo`).
-   **Output**: JSON object `{ relevant_experience, relevant_skills }`.

### `generateResume(profile: string, jobInfo: any, matchInfo: any)`

Generates a tailored Markdown version of the candidate's resume.

-   **Inputs**: Profile, Job Info, Match Info.
-   **Output**: Markdown Resume.
-   **Constraints**:
    -   DO NOT fabricate experience.
    -   DO NOT add new roles not found in the profile.
    -   ONLY rewrite existing bullet points for better alignment.

### `generateCoverLetter(profile: string, jobInfo: any, template: string)`

Generates a tailored cover letter based on a provided Markdown template.

-   **Inputs**: Profile, Job Info, Template.
-   **Output**: Markdown Cover Letter.
-   **Notes**: Replaces placeholders like `{{company}}`, `{{role}}`, and `{{custom_paragraph}}`.

---
*Last Updated: 2026-04-07*
