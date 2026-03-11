# JobTailor

AI-powered resume tailoring — upload your resume once, and a browser extension helps you create a tailored version for every job you apply to.

## Architecture

```
Browser Extension  ──▶  Next.js API Routes  ──▶  OpenAI / Anthropic
                              │
                        Supabase (Auth, DB, Storage)
```

- **Browser Extension** (Chrome, Firefox, Edge): Detects job descriptions, scrapes job details, and triggers AI-powered resume tailoring via a popup
- **Web App** (Next.js 14+ App Router): Dashboard for uploading base resumes, viewing tailored versions, configuring AI settings, and managing your account
- **Backend** (Next.js API Routes): Handles resume upload, AI tailoring orchestration, PDF generation, and usage tracking
- **Database** (Supabase/PostgreSQL): Stores user settings, resumes, tailored versions, and usage data with row-level security

## Features

- **Job Detection**: Automatically identifies job descriptions on LinkedIn, Indeed, Greenhouse, Lever, Workday, and more using heuristic scoring and JSON-LD parsing
- **AI Tailoring**: Rewrites your resume to match each job — adjusts bullet points, summary, skills ordering, and terminology without fabricating experience
- **PDF Generation**: Creates clean, professional PDFs from the tailored content using pdfkit
- **Multi-Provider AI**: Defaults to GPT-4o Mini (cheapest). Supports OpenAI and Anthropic models. Bring your own API key for unlimited usage
- **Free Tier**: 5 tailored resumes per month at no cost. Unlimited with your own API key
- **Cross-Browser**: Chrome, Firefox, and Edge (Safari support via web extension converter)

## Project Structure

```
JobTailor/
├── extension/                  # Browser extension
│   ├── src/
│   │   ├── manifest.chrome.json
│   │   ├── manifest.firefox.json
│   │   ├── background.ts       # Service worker
│   │   ├── content.ts          # Page scraping + job detection
│   │   ├── popup/              # Extension popup UI
│   │   └── lib/                # Detector, scraper, API client
│   ├── build.mjs               # esbuild build script
│   └── package.json
├── web/                        # Next.js web application
│   ├── src/
│   │   ├── app/                # App router pages + API routes
│   │   ├── components/         # React components
│   │   ├── lib/                # Supabase, AI, PDF, encryption utils
│   │   └── types/              # TypeScript types
│   ├── supabase/migrations/    # Database schema
│   └── package.json
├── package.json                # Root monorepo (npm workspaces)
└── README.md
```

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key (for the default free tier)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/JobTailor.git
cd JobTailor
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `web/supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
3. Create two storage buckets: `base-resumes` and `tailored-resumes` (both private)
4. Enable Google OAuth under Authentication > Providers (optional)

### 3. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example web/.env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `OPENAI_API_KEY` — Platform default OpenAI key
- `ENCRYPTION_KEY` — 32-byte hex key for encrypting user API keys

Generate an encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run the web app

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build and load the extension

```bash
npm run build:ext
```

**Chrome/Edge:**
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist/chrome`

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `extension/dist/firefox/manifest.json`

### 6. Connect the extension

1. Click the JobTailor extension icon
2. Click "Log In" — this opens the web app
3. Sign up or log in, then navigate to `/extension/connect`
4. The extension is now authenticated

## Usage

1. Upload your base resume PDF at `/dashboard/upload`
2. Browse job listings normally (LinkedIn, Indeed, etc.)
3. When the extension detects a job description, a green badge appears
4. Click the extension icon and press "Tailor My Resume"
5. View and download your tailored resume from the dashboard

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI SDK, Anthropic SDK
- **PDF**: pdfkit (generation), pdf-parse (extraction)
- **Extension**: WebExtensions API (Manifest V3), webextension-polyfill, esbuild

## License

MIT License
