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
- `/lib/ai.ts`: Core AI logic (OpenAI integration).
- `/templates`: Markdown templates for generated documents.
- `/docs`: Detailed system documentation and bug trackers.

## 🚦 Getting Started

1. **Environment Variables**: Create a `.env.local` file with:
   ```env
   OPENAI_API_KEY=your_key_here
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## 📜 Documentation

For deeper architectural details, check out:
- [System Overview](docs/system_overview.md)
- [API Reference](docs/api_reference.md)
- [Bug Tracker](docs/bug_tracker.md)

---
*Built with precision and intentionality by [Antigravity].*
