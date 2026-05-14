<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI Design Rules
**CRITICAL: High Contrast Enforcement**
Whenever generating UI components (especially modals, forms, and alerts), you MUST explicitly set text colors to ensure high contrast with the background color (e.g., `text-black` on light backgrounds like `#f4f4f0`, `bg-white`, or yellow `#e8fc3b`). Never rely solely on body inheritance as dark mode browser extensions or nested contexts can break text visibility. For input fields, always explicitly declare `text-black` and `placeholder:text-black/40` when using a white background.
