# CLAUDE.md — DevScope Project

> This file is the single source of truth for Claude Code (VSCode).
> Read this entirely before making any change to the codebase.

---

## 📌 Project Overview

**DevScope** is an AI-powered GitHub profile analyzer built for developers.
A user enters any GitHub username → the app fetches their public data (repos, languages, commits, stars, README) → an LLM (Llama 3.3 70B via Groq API) generates a detailed developer report including:

- Dominant tech stack & languages
- Project quality assessment
- Strengths & weaknesses
- Estimated seniority level
- Recommended job types / roles
- Improvement suggestions

**Live URL (target):** `https://devscope.vercel.app` (or custom domain)
**Repo:** GitHub — `github.com/Gninho-silue/devscope`

---

## 👤 Author

**Gninninmaguignon Silué**

- Email: gninninmaguignonsilue@gmail.com
- GitHub: github.com/Gninho-silue
- LinkedIn: linkedin.com/in/gninema-silue
- Portfolio: silue-portfolio.vercel.app

---

## 🏗️ Tech Stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Framework  | Next.js 14+ (App Router)                                          |
| Language   | TypeScript (strict mode)                                          |
| Styling    | Tailwind CSS + shadcn/ui                                          |
| AI         | Groq API (llama-3.3-70b-versatile) — free tier                    |
| Data       | GitHub REST API v3 (no auth required for public data)             |
| Animations | Framer Motion                                                     |
| State      | React hooks (useState, useReducer) — no external state lib needed |
| Deployment | Vercel                                                            |
| Testing    | Vitest + React Testing Library                                    |
| Linting    | ESLint + Prettier                                                 |

---

## 📁 Project Structure

```
devscope/
├── app/
│   ├── layout.tsx              # Root layout, metadata, fonts
│   ├── page.tsx                # Home page (Hero + search form)
│   ├── globals.css             # Global styles + Tailwind base
│   ├── analyze/
│   │   └── [username]/
│   │       └── page.tsx        # Results page for a given username
│   └── api/
│       ├── github/
│       │   └── route.ts        # GET /api/github?username=xxx
│       └── analyze/
│           └── route.ts        # POST /api/analyze (calls Claude API)
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   └── SearchForm.tsx
│   ├── analysis/
│   │   ├── ReportCard.tsx      # Full analysis report
│   │   ├── StackBadges.tsx     # Language/tech badges
│   │   ├── SeniorityMeter.tsx  # Visual seniority indicator
│   │   ├── ProjectList.tsx     # Top repos with stats
│   │   └── ScoreChart.tsx      # Recharts radar/bar chart
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── GithubCard.tsx      # User avatar + bio card
├── lib/
│   ├── github.ts               # GitHub API client functions
│   ├── groq.ts                 # Groq API wrapper (analyzeProfile)
│   ├── prompts.ts              # LLM prompt templates
│   └── utils.ts                # Shared utility functions
├── types/
│   ├── github.ts               # GitHub API response types
│   └── analysis.ts             # Analysis report types
├── hooks/
│   └── useAnalysis.ts          # Custom hook for analysis flow
├── public/
│   └── og-image.png            # Open Graph image
├── .env.local                  # Local secrets (never commit)
├── .env.example                # Template for env vars
├── CLAUDE.md                   # This file
├── README.md                   # Public-facing documentation
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 🌿 Git & GitHub Workflow — STRICT RULES

### Branch Strategy (GitHub Flow)

```
main                    ← Production branch. Always deployable.
  └── feat/hero-section
  └── feat/github-api
  └── feat/claude-integration
  └── feat/analysis-report-ui
  └── feat/seniority-meter
  └── feat/score-charts
  └── fix/rate-limit-handling
  └── chore/setup-ci
```

### Rules — Claude Code must follow these ALWAYS:

1. **NEVER commit directly to `main`**
2. For every new feature, create a branch: `git checkout -b feat/<feature-name>`
3. Commit messages must follow **Conventional Commits**:
   - `feat: add GitHub API client`
   - `fix: handle missing repo description`
   - `chore: configure ESLint`
   - `docs: update README with setup instructions`
   - `test: add unit tests for github.ts`
   - `style: format components with Prettier`
   - `refactor: extract prompt builder to lib/prompts.ts`
4. Each branch must have **one clear purpose** — no mixing features
5. After completing a feature branch → open a **Pull Request** on GitHub, write a clear PR description, then merge to `main` via squash merge
6. Delete branch after merge

### Example Workflow for a Feature

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feat/github-api-client

# Work, then commit
git add .
git commit -m "feat: add GitHub API client with user and repos endpoints"

# Push and open PR
git push origin feat/github-api-client
# → Open PR on GitHub: "feat: GitHub API integration"
# → Merge when ready → delete branch
```

---

## 🔑 Environment Variables

```bash
# .env.local (never commit this file)
GROQ_API_KEY=your_groq_api_key_here               # Get it free at console.groq.com
GITHUB_TOKEN=your_github_pat_here                 # Optional — increases rate limit from 60 to 5000 req/hr
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# .env.example (commit this file as template)
GROQ_API_KEY=
GITHUB_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📡 API Design

### `GET /api/github?username=<username>`

Fetches and aggregates public GitHub data for the given username.

**Returns:**

```ts
{
  user: {
    login: string
    name: string
    bio: string
    avatar_url: string
    public_repos: number
    followers: number
    following: number
    created_at: string
    location: string
    blog: string
  }
  repos: Array<{
    name: string
    description: string
    language: string
    stargazers_count: number
    forks_count: number
    topics: string[]
    updated_at: string
    html_url: string
  }>
  languages: Record<string, number>   // { "TypeScript": 45, "Java": 30, ... }
  topRepos: Repo[]                    // Top 5 by stars
  totalStars: number
  accountAgeYears: number
}
```

**Error handling:**

- 404 → user not found
- 403 → rate limit exceeded → return helpful message
- 500 → GitHub API unavailable

---

### `POST /api/analyze`

Calls Groq API (llama-3.3-70b-versatile) with aggregated GitHub data and returns structured analysis.

**Request body:**

```ts
{
  githubData: GithubData; // From /api/github
  username: string;
}
```

**Returns:**

```ts
{
  seniority: {
    level: "Junior" | "Mid-Level" | "Senior" | "Expert"
    score: number           // 0-100
    reasoning: string
  }
  stack: {
    primary: string[]       // ["Java", "Spring Boot", "React"]
    secondary: string[]     // ["Docker", "PostgreSQL"]
    missing: string[]       // ["Testing", "CI/CD"]
  }
  strengths: string[]
  weaknesses: string[]
  projectHighlights: Array<{
    name: string
    assessment: string
    score: number
  }>
  recommendations: string[]
  jobRoles: string[]        // ["Backend Developer", "Full Stack Engineer"]
  summary: string           // 2-3 sentence overall summary
}
```

---

## 🤖 Groq AI Integration

### Model

Always use: `llama-3.3-70b-versatile`
Free tier: 30 req/min, 6000 tokens/min — sufficient for DevScope.

### SDK Setup (in `lib/groq.ts`)

```ts
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
```

### Calling the API

```ts
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: buildAnalysisPrompt(githubData) }],
  temperature: 0.3,
  max_tokens: 2000,
});
const raw = completion.choices[0]?.message?.content ?? "";
const result: AnalysisResult = JSON.parse(raw);
```

### Prompt Strategy (in `lib/prompts.ts`)

The prompt must:

1. Receive structured GitHub data as context
2. Ask the model to respond **only in valid JSON** matching the `AnalysisResult` type
3. Be explicit about the JSON schema expected
4. Include instructions to be constructive and specific, not generic

**Prompt template skeleton:**

```
You are a senior software engineer and technical recruiter analyzing a developer's GitHub profile.

Based on the following GitHub data, provide a structured technical assessment.

GitHub Data:
<data>
{JSON.stringify(githubData, null, 2)}
</data>

Respond ONLY with a valid JSON object matching this exact schema:
{
  "seniority": { "level": "...", "score": 0-100, "reasoning": "..." },
  "stack": { "primary": [...], "secondary": [...], "missing": [...] },
  "strengths": [...],
  "weaknesses": [...],
  "projectHighlights": [{ "name": "...", "assessment": "...", "score": 0-100 }],
  "recommendations": [...],
  "jobRoles": [...],
  "summary": "..."
}

Be specific, technical, and constructive. No markdown, no preamble. JSON only.
```

---

## 🎨 Design System

### Colors (Tailwind config)

```js
primary: "#2453D3"; // Silué's brand blue (matches his PFE design system)
background: "#0B1223"; // Dark navy
surface: "#111827"; // Card background
text: "#F9FAFB";
muted: "#6B7280";
accent: "#60A5FA";
success: "#10B981";
warning: "#F59E0B";
```

### Typography

- Display: `Syne` or `Space Grotesk` (bold headlines)
- Body: `DM Sans` (readable, modern)
- Code/mono: `JetBrains Mono`

### UI Principles

- Dark theme by default
- Cards with subtle border + glassmorphism effect
- Animated skeleton loaders during API calls
- Smooth page transitions (Framer Motion)
- Mobile-first responsive layout

---

## 📋 Feature Roadmap & Branch Plan

| Priority | Feature                                             | Branch                      | Status |
| -------- | --------------------------------------------------- | --------------------------- | ------ |
| 1        | Project setup (Next.js, TS, Tailwind, ESLint)       | `chore/project-setup`       | ✅ DONE |
| 2        | Hero section + search form UI                       | `feat/hero-section`         | ✅ DONE |
| 3        | GitHub API client + `/api/github` route             | `feat/github-api`           | ✅ DONE |
| 4        | Groq AI integration + `/api/analyze` route          | `feat/groq-integration`     | ✅ DONE |
| 5        | Results page layout + routing                       | `feat/results-page`         | ✅ DONE |
| 6        | ReportCard component (strengths, weaknesses, roles) | `feat/report-card`          | ✅ DONE |
| 7        | SeniorityMeter visual component                     | `feat/seniority-meter`      | ✅ DONE |
| 8        | Stack badges + language breakdown                   | `feat/stack-badges`         | ✅ DONE |
| 9        | Score charts (Recharts radar chart)                 | `feat/score-charts`         | ✅ DONE |
| 10       | Loading states + error handling                     | `feat/loading-error-states` | ✅ DONE |
| 11       | Responsive + mobile polish                          | `feat/mobile-responsive`    | ✅ DONE |
| 12       | README + .env.example + deployment docs             | `docs/readme-and-setup`     | ✅ DONE |
| 13       | Vercel deployment + env config                      | `chore/vercel-deploy`       | ✅ DONE |
| 14       | Unit tests + security scanning                      | `chore/tests-and-security`  | ✅ DONE |

---

## 🧪 Testing & Security

### Test Files

| File | What it covers |
| ---- | -------------- |
| `tests/unit/lib/github.test.ts` | `aggregateLanguages()` — percentages, empty repos, null languages, sort order |
| `tests/unit/lib/prompts.test.ts` | `buildAnalysisPrompt()` — returns string, contains schema fields, injects `<data>` tags, JSON-only instruction |
| `tests/unit/components/SearchForm.test.tsx` | Renders input/button, empty-submit error, invalid username error, `router.push` called with correct path |
| `tests/unit/components/SeniorityMeter.test.tsx` | Renders level label, `/100` indicator, blue (< 40) / orange (40–69) / green (≥ 70) color logic |
| `tests/unit/api/github.test.ts` | 400 missing/invalid username, 404 user not found, 403 rate limit, 200 success shape, 500 unexpected error |

### Running Tests Locally

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage
# → Report written to ./coverage/
```

### Security Audit

```bash
# Run audit-ci with allowlist (dev-only vercel vulnerabilities are allowlisted)
npm run security:audit

# Raw npm audit
npm audit --audit-level=moderate
```

All 31 vulnerabilities detected by `npm audit` are in the `vercel` devDependency and are allowlisted in `.auditrc.json` because they are not shipped in the production bundle. The fix requires a breaking downgrade (`vercel@32.3.0`).

### CI/CD Pipeline

```
security ─┐
           ├─→ build ─→ deploy (main only)
lint ──→ test ─┘
type-check (parallel with lint/security)
```

- **security** — runs `npm audit` + `audit-ci`, in parallel with lint
- **lint** — runs ESLint
- **type-check** — runs `tsc --noEmit`
- **test** — runs after lint, uploads coverage artifact
- **build** — runs only if both `test` AND `security` pass
- **deploy** — triggered only on push to `main` after CI passes

---

## ✅ Code Quality Rules

- **TypeScript strict mode** — no `any` types, ever
- **No inline styles** — use Tailwind classes only
- **Component naming** — PascalCase for components, camelCase for files in `lib/` and `hooks/`
- **API routes** — always validate inputs, handle all error cases, return proper HTTP status codes
- **Never expose API keys** — all calls to Groq and GitHub must go through Next.js API routes, never from the client
- **Comments** — only for complex business logic, not obvious code
- **Imports** — use absolute imports via `@/` alias (configured in tsconfig)

---

## 🚀 Local Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/Gninho-silue/devscope.git
cd devscope

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Fill in your GROQ_API_KEY and optionally GITHUB_TOKEN

# 4. Run development server
npm run dev
# → http://localhost:3000

# 5. Run tests
npm run test

# 6. Lint & format
npm run lint
npm run format
```

---

## 📝 Notes for Claude Code

- When creating a new component, always create its TypeScript interface/type in `types/` first
- When working on the GitHub API client, be mindful of rate limits — add proper error messages for the 403 case
- The `/api/analyze` route will take 5-15 seconds (LLM call) — ensure the UI shows a meaningful loading state
- All text visible to users should be in **French and English** (bilingual) — the target audience includes Moroccan and French developers
- For the seniority score visualization, use a circular progress component or a custom SVG — not a plain progress bar
- Keep bundle size small — don't import entire icon libraries, use tree-shakeable imports

---

_Last updated: April 2026 | Author: Gninninmaguignon Silué_
