# Decision Lab

A mobile-first teaching tool for **ØAADM3700 Decision-Making Processes in Organizations**. The project uses independent branding and is not an official OsloMet website.

## Current features

- Precision Grid course hub with eight dated teaching days
- Day pages with topics, readings, session plans and assignments
- Day 1 bargain, exam-result choice, rational decision tool and REI-10 activities
- Private, on-device scoring for REI-10 and the rational decision tool
- Anonymous live response collection for the two classroom polls
- Instructor controls with private preview and deliberate result reveal
- Three design directions retained at `/design`
- Security headers configured for deployment

Supabase is accessed only through server routes. Follow
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for the one-time database and instructor
email configuration.

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

The application is deployed through Vercel. Its four required server environment
variables are documented in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).
