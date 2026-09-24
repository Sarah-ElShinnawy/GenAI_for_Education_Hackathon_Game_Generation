# Learn & Play AI — Educational Game Generator
### GenAI for Education Hackathon: Game Generation

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=flat&logo=vercel)](https://eduplay-ai-coral.vercel.app/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.26-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=flat&logo=react)](https://react.dev/)
[![Gemini Multimodal AI](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%203.5%20%2F%202.5-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

> **Live Deployment:** [https://eduplay-ai-coral.vercel.app/](https://eduplay-ai-coral.vercel.app/)  
> **Repository:** [https://github.com/Sarah-ElShinnawy/GenAI_for_Education_Hackathon_Game_Generation](https://github.com/Sarah-ElShinnawy/GenAI_for_Education_Hackathon_Game_Generation)

---

## 🌟 Overview

**Learn & Play AI** is an intelligent full-stack educational engine that bridges static study materials with interactive gameplay. Built for learners of all ages—from elementary school to university—it transforms abstract concepts, textbooks, lecture slides, and classroom syllabi into rich, single-file HTML5 games with zero external dependencies.

---

## 🎮 Core Capabilities

1. **Prompt-to-Game Synthesis (`/api/generate-game`)**:
   - Type any curriculum topic or select quick suggestions.
   - Synthesizes fully functional, single-file HTML5 games with rich vector SVG artwork, Web Audio API sound effects, and zero crude primitives.
   - Calibrated for **Elementary (Ages 6–11)**, **High School (Ages 12–18)**, and **University (Higher Ed)**.

2. **Multimodal Document & Slide Ingestion (`/api/generate-from-docs`)**:
   - Supports upload of **up to 10 PDF and PowerPoint (.ppt, .pptx) presentations**.
   - Directly parses text, diagrams, and formulas.
   - Evaluates **conceptual density** (`light`, `moderate`, `dense`) and automatically partitions complex curricula into **1 to 5 modular games**.

3. **Slide-Over Document Side Viewer (`/api/analyze-document`)**:
   - Inspect slides and lecture notes side-by-side with your game.
   - Click *"Focus AI Game Generator on Slide X"* to dynamically generate games targeting specific slides.

4. **Explanatory "What Changed?" Transition Modals**:
   - Clearing stages triggers scientific transition breakdowns explaining the exact phenomenon that occurred.
   - Locks the continue button with a **5-second countdown timer** to ensure deliberate reading and conceptual retention.

5. **Integrated Learning HUD**:
   - Real-time tracking of **Key Takeaways** and **Challenge Objectives**.
   - Automatically checks off milestones as students solve challenges in the sandboxed iframe.

6. **Unified Database Layer (`/api/db/games`)**:
   - Persistent storage for generated game suites, challenge milestones, and educational history.
   - Zero-crash architecture: works with Vercel Postgres / Neon when configured, with automatic serverless local storage fallback.

---

## 🚀 Environment Variables (Vercel Configuration)

To run the application fully on Vercel, configure these environment variables in your **Vercel Project Settings $\rightarrow$ Environment Variables**:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key | **Yes** | `AIzaSy...` |
| `GEMINI_MODEL` | Primary AI model | Optional | `gemini-3.5-flash-lite` |
| `POSTGRES_URL` | Vercel Postgres / Neon connection string | Optional | `postgres://user:pass@host/db` |

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env.local
cp .env.example .env.local

# 3. Run development server
npm run dev

# 4. Run production build check
npm run build
```

The application will be accessible at `http://localhost:3000`.

---

## 🔒 Security & Privacy

Every generated educational game runs inside an isolated, sandboxed `<iframe>` (`sandbox="allow-scripts allow-modals allow-forms"`). Games are 100% self-contained single-file HTML code with embedded SVGs and Web Audio API, ensuring zero external asset tracking or school privacy compliance issues.
