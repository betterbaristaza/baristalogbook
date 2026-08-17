# Barista Logbook

Barista Logbook is a mobile-first coffee brewing log for baristas and coffee enthusiasts.

The app lets users save coffees, record brews, track coffee usage, upload coffee and brew photos, and keep their brewing history synced across devices.

## Current Status

Barista Logbook is under active development toward a public V1 release.

Target release: September 2026.

## Current Features

### Accounts

* Supabase authentication
* User profiles
* Profile persistence across sessions
* Account-based data separation
* Sign out
* Cross-device data sync

### Coffee Library

* Add coffees
* Edit coffees
* Delete coffees
* Track coffee remaining by weight
* Upload front bag photo
* Upload back bag photo
* Private image storage

### Brew Log

* Create brew records
* Edit brew records
* Delete brew records
* Track brew recipes and results
* Optional brew photo
* Automatic coffee weight deduction
* Brew history
* Search and filtering

### PWA

Barista Logbook can be installed as a Progressive Web App on supported devices.

Current PWA support includes:

* Installable application
* Service worker
* Cached application resources
* Mobile standalone display

Additional PWA icons will be added before public release.

## Technology

The application currently uses:

* React
* TypeScript
* Vite
* Tailwind CSS
* Supabase Authentication
* Supabase Database
* Supabase Storage
* Google Gemini
* Vercel
* Vite PWA

## Project Structure

Key application areas:

```text
components/
    Application UI components

context/
    Authentication and application context

services/
    brewLogService.ts
    coffeeService.ts
    geminiService.ts
    imageService.ts
    profileService.ts
    storageService.ts
    supabaseClient.ts

supabase/
    migrations/
        Database and storage migrations

public/
    PWA and public assets
```

## Supabase

Supabase currently handles:

* Authentication
* User profiles
* Coffee records
* Brew records
* Row Level Security
* Coffee weight updates
* Private image storage

User data is linked to authenticated Supabase user accounts.

Database access must remain protected by Row Level Security.

## Image Storage

Coffee and brew images are stored in the private Supabase bucket:

```text
logbook-images
```

Uploads are separated by authenticated user ID.

Supported image types:

```text
JPEG
PNG
WebP
```

Maximum file size:

```text
5 MB
```

Storage policies restrict users to their own image folders.

## Environment Variables

Create a `.env.local` file for local development.

Required Supabase variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Current Gemini configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit real environment values or secret keys to GitHub.

## Gemini Security

Gemini is currently connected through the client application.

This is temporary during development.

Before public release, Gemini requests must be moved to a server-side function so the Gemini API key is never exposed in the browser.

Planned request path:

```text
Browser
    ↓
Supabase Edge Function
    ↓
Gemini API
```

This is a V1 release requirement.

## Local Development

Clone the repository and install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Vercel Deployment

The production application is deployed through Vercel.

Production deployment uses:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

Production environment variables must be configured in Vercel rather than committed to the repository.

## Development Rule

A change is considered complete only when:

1. The feature works locally.
2. Mobile behaviour has been checked.
3. Error states have been considered.
4. Database permissions have been checked when relevant.
5. `npm run build` passes.
6. The change has been committed.
7. The change has been pushed to GitHub.
8. The production deployment works when the change affects production.

## V1 Product Goal

The V1 product should allow a new user to:

1. Create an account.
2. Complete their profile.
3. Add a coffee.
4. Upload coffee bag photos.
5. Log a brew.
6. Upload an optional brew photo.
7. Track remaining coffee.
8. Review previous brews.
9. Sign in from another device and access the same data.
10. Upgrade to a paid account.

## V1 Development Priorities

Before public release:

* Complete account recovery and verification flows
* Improve first-time onboarding
* Add Brew Again
* Add saved recipes
* Move Gemini requests server-side
* Add Free and Pro account levels
* Add subscription payments
* Add subscription management
* Add account deletion
* Add user data export
* Complete mobile testing
* Add Privacy Policy
* Add Terms of Service
* Add support contact
* Run closed beta testing

## Post-Launch

Features intentionally postponed until after V1 include:

* Café team accounts
* Roaster accounts
* Community feed
* Public profiles
* Followers
* Marketplace
* Leaderboards
* Native mobile applications
* Equipment integrations

The immediate product focus is:

```text
Record → Brew → Compare → Improve
```
