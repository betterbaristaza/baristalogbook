# Barista Logbook Deployment Guide

This application is built with React, Vite, and tailwindCSS. It is configured for easy deployment on **Vercel**.

## Vercel Deployment Settings

When importing this project into Vercel, use the following settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables

You **must** add the following environment variable in the Vercel Dashboard (**Settings > Environment Variables**):

| Key | Value | Description |
|-----|-------|-------------|
| `GEMINI_API_KEY` | `your_api_key_here` | Your Google Gemini API Key |

---

## Technical Details

### PWA Support
The app includes a Service Worker for offline support and is installable as a PWA on mobile devices.
- **Icon Support**: Currently using `mask-icon.svg` for the manifest.
- **TODO**: Generate and add `pwa-192x192.png` and `pwa-512x512.png` to the `public/` folder. While SVG is supported by modern browsers, PNG icons are required for maximum compatibility with all Android and iOS device home screens.

### Security Note
The Gemini API key is currently used in the client-side bundle. For production applications handling sensitive data, it is recommended to proxy these requests through a backend/serverless function to keep the key hidden from the end-user.

### Storage
The logbook currently uses `localStorage` for data persistence. No external database is required for the basic functionality.
