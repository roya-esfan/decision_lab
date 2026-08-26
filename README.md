# Decision Lab

A mobile-first teaching tool for **ØAADM3700 Decision-Making Processes in Organizations**. The project uses independent branding and is not an official OsloMet website.

## Current features

- Precision Grid course hub and six teaching-day placeholders
- Day 1 REI-10 cognitive-style activity
- Private, on-device scoring with no student data collection
- Three design directions retained at `/design`
- Security headers configured for deployment

Live classroom sessions, aggregate results, instructor controls and Supabase integration are planned but are not connected yet.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm run build
```

## Deployment

The application can be imported directly into Vercel as a Next.js project. The current version requires no environment variables.
