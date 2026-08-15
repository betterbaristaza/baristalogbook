# Barista Logbook

Barista Logbook is a React and Vite application for recording coffees, brew recipes, tasting results, and equipment settings.

## Current Features

- Supabase email authentication
- User profiles
- Coffee Library with create, read, update, and delete functions
- Brew Journal with create, read, update, and delete functions
- Coffee remaining-weight tracking
- User data isolation through Supabase Row Level Security
- Atomic brew creation and coffee-weight reduction
- Data sync across devices
- PWA support
- AI brewing advice is under development and is not enabled in production.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Google Gemini
- Vite PWA

## Local Setup

Clone the repository:

```bash
git clone https://github.com/betterbaristaza/baristalogbook.git
cd baristalogbook
```

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env.local` or real API keys.

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Supabase

The application stores profiles, coffees, and brew logs in Supabase.

Row Level Security restricts each signed-in user to their own records.

Migration files are stored in:

```text
supabase/migrations
```

The atomic brew-weight migration:

- Confirms the brew belongs to the signed-in user.
- Confirms the selected coffee belongs to the same user.
- Requires a positive dose when a coffee is selected.
- Creates the brew and reduces the coffee weight in one transaction.
- Rolls back both actions if either action fails.
- Prevents remaining weight from dropping below zero.

## Vercel Deployment

Use these settings:

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
```

Add these environment variables in the Vercel project settings:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Do not add the Gemini key to the client build. AI requests must be moved to a server-side function before production use.

Environment variable changes require a new Vercel deployment.

## Security

The Supabase publishable key is intended for browser use. Row Level Security protects database records.

Never commit secret keys, service-role keys, passwords, or private API keys.

## PWA Support

The app includes a service worker and can be installed as a PWA.

The current manifest uses `mask-icon.svg`. PNG icons at 192 by 192 pixels and 512 by 512 pixels are still needed for wider device support.

## Git Workflow

Before starting work:

```bash
git switch main
git pull origin main
git status
npm run build
```

Create a branch for each task:

```bash
git switch -c type/short-task-name
```

Before saving work:

```bash
git status
git diff
npm run build
git add .
git commit -m "Describe the completed change"
git push -u origin type/short-task-name
```