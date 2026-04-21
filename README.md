# Job Application Assistant (JOB ASSIST)

An AI-powered automation system for managing, tracking, and completing job applications. JOB ASSIST uses local AI context matched with real-time job listings to streamline your career search.

## 🚀 Overview

JOB ASSIST is an editorial-style, high-fidelity dashboard built with **Next.js 14**, **Tailwind CSS**, and **OpenAI**. It specializes in:

- **AI-Driven Fact Matching**: Automatically extracts job requirements and matches them against your professional profile.
- **Dynamic Content Generation**: Generates resumes, cover letters, and application answers on the fly.
- **Job Watcher**: Monitors and tracks specific job application flows.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Creative/Editorial CSS with Tailwind
- **AI Models**: OpenAI GPT-4o-mini
- **Icons**: Lucide Icons
- **Fonts**: Playfair Display (Serif), IBM Plex Mono (Monospace)

## 📁 System Architecture

- `/app`: Main dashboard, job-watcher, profile-editor, and application-assistant routes.
- `/lib/ai/`: Core AI architecture with stateless providers (OpenAI, Gemini, Local).
- `/lib/utils/privacy.ts`: Client-side PII masking and unmasking engine.
- `/templates`: Markdown templates for generated documents.
- `/docs`: Detailed system documentation and bug trackers.

## 🔒 Privacy & Security (Bring Your Own Key)

JOB ASSIST is designed as a stateless, client-first application to maximize your privacy and security:

- **BYOK (Bring Your Own Key)**: API keys are inputted in the browser and stored locally in your browser's `localStorage` — they are never saved to a database or server file. 
- **PII Masking**: The system features a built-in privacy guard that masks your sensitive data (Name, Email, Phone, Address) with placeholders (e.g. `{{USER_NAME}}`) *before* sending context to any AI model. The real data is re-injected client-side when viewing or downloading the final PDF.
- **Strict CSP**: The application utilizes a strict Content Security Policy to heavily mitigate XSS attacks against the `localStorage` vault.

## 🚦 Getting Started

### 🐳 The Docker Way (Recommended & Seamless)

1.  **Prepare Environment**: 
    ```bash
    cp .env-example .env
    ```
    (Enter your `OPENAI_API_KEY` or `GEMINI_API_KEY` in `.env` if using cloud providers).

2.  **Launch System**:
    ```bash
    docker-compose up --build
    ```
    *Note: The system will automatically pull the **Llama 3** model on the first run. This may take a few minutes depending on your internet connection.*

3.  **View in Browser**: Open **[http://localhost:3000](http://localhost:3000)**.

---

### 💻 The Manual Way (Local Dev)

1.  **Setup Env**: `cp .env-example .env.local`
2.  **Install**: `npm install`
3.  **Run**: `npm run dev`

## 📜 Documentation

For deeper architectural details, check out:
- [System Overview](docs/system_overview.md)
- [API Reference](docs/api_reference.md)
- [Bug Tracker](docs/bug_tracker.md)

---
