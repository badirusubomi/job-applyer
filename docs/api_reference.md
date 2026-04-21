# API Reference: JOB ASSIST Core Logic

This document describes the core AI integration logic and the privacy protection layer introduced in the stateless refactor.

## Provider Architecture (`lib/ai/`)

All AI interactions are handled by specific providers (OpenAI, Gemini, Local) which are initialized via factory functions.

### `getProvider(model: AIModelType, apiKey?: string)`
The entry point for retrieving a configured provider instance.
- **`model`**: `'openai' | 'gemini' | 'local'`.
- **`apiKey`**: Optional key provided by the client. For `'local'`, this acts as the base URL.

---

## AI Provider Interface

Every provider implements the following asynchronous methods:

### `extractJobInfo(description: string)`
Extracts structured data from a raw job description.
- **Output**: `{ role, company, skills, responsibilities }`.

### `matchProfile(profile: string, jobInfo: JobInfo)`
Matches candidate profile (Markdown) against job requirements.
- **Output**: `{ relevant_experience, relevant_skills }`.

### `generateResume(profile: string, jobInfo: JobInfo, matchInfo: MatchInfo)`
Generates a tailored JSON structure for rendering a resume.

### `generateCoverLetter(profile: string, jobInfo: JobInfo, template: string)`
Generates a tailored JSON structure for a cover letter.

---

## Privacy Guard (`lib/utils/privacy.ts`)

Ensures PII is never sent to the LLM in plain text.

### `maskPii(text: string, config: PrivacyConfig)`
Scans text for values defined in `PrivacyConfig` (Name, Email, Phone, Address) and replaces them with placeholders like `{{USER_NAME}}`.

### `unmaskPii(data: any, config: PrivacyConfig)`
Recursively replaces placeholders in a generated object or string back with the user's real values before local use.

---

## REST API Endpoint: `/api/assistant/generate` [POST]

The primary endpoint for all assistant generations.

### Request Body
- **`jobDescription`**: string (required)
- **`profile`**: string (required - Markdown)
- **`model`**: 'openai' | 'gemini' | 'local'
- **`apiKey`**: string (required if model is cloud-based)
- **`actions`**: `{ resume: boolean, coverLetter: boolean, answers: boolean }`
- **`questions`**: string[] (optional - for application answers)

---
*Last Updated: 2026-04-20*
