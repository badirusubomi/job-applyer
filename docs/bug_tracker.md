# JOB ASSIST: Bug Tracker & Task Log

This document tracks all known issues, resolved bugs, and architectural updates.

## Status Summary

- ✅ System Overview Updated (Stateless BYOK)
- ✅ AI Provider Refactor (Dynamic Keys)
- ✅ PII Masking Implementation (Privacy Guard)
- ✅ Sidebar Navigation & Workspace Built
- ✅ Profile Persistence (LocalStorage)
- ✅ Monaco Initialization Fix (CSP Update)

## Issue Log

| Status | Date Recorded | Description | Root Cause | Fix Implemented |
| :--- | :--- | :--- | :--- | :--- |
| ✅ | 2026-04-20 | Monaco initialization error: [object Event] | Strict CSP blocked JSDelivr assets and Blob workers. | Updated `next.config.ts` to allow `cdn.jsdelivr.net` and `worker-src`. |
| ✅ | 2026-04-20 | PII leakage concern for public release. | Raw profiles being sent to LLMs. | Implemented `lib/utils/privacy.ts` masking layer. |
| ✅ | 2026-04-20 | Global API key requirement. | `process.env` keys forced single-user mode. | Refactored providers to be stateless (BYOK). |
| ✅ | 2026-04-07 | Skills not being followed by AI assistant. | Metadata triggers too generic. | Descriptions updated to include "MANDATORY BEHAVIORAL MANDATE". |
| ✅ | 2026-04-07 | LLM Connection Refused/Not Found. | Container networking & missing model. | Fixed docker-compose internal URL and pulled llama3. |

---
*Last Updated: 2026-04-20*
