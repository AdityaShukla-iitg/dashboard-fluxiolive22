# Fluxio Live Client Portal (`app.fluxio.live`)

Private, high performance client portal for Fluxio Live.
Organizes deliverable assets (posters and reels) by day, provides instant copy captions, supports seamless revision requests with file uploads, and includes a full custom admin management suite.

## Tech Stack
- Next.js 14 App Router
- TypeScript (Strict mode)
- Tailwind CSS
- Anton & Space Grotesk fonts
- Sanity CMS (Headless data layer)
- Jose & bcrypt (Edge session auth)
- Resend (Email notifications for revision requests)

## Environment Variables
Create a `.env` or `.env.local` file with:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=6cycexy8
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_write_token
ADMIN_PASSWORD=your_admin_password
SESSION_SECRET=your_32_char_minimum_secret_key
RESEND_API_KEY=your_resend_api_key
```

## Vercel Deployment
1. Import this repository into Vercel.
2. Add the environment variables above in Project Settings.
3. Deploy. No special build settings needed.

## Local Development
```bash
npm install
npm run dev
```
- Admin panel: `http://localhost:3000/admin`
- Client gate: `http://localhost:3000/[client-slug]`
