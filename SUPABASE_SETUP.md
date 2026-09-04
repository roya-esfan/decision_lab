# Supabase setup

The Decision Lab uses Supabase only for anonymous classroom sessions,
privacy-preserving completion counts and the instructor's email sign-in.
The content of private activities—including problems, criteria, alternatives,
ratings, REI answers and REI scores—remains on the student's device and is
never sent to Supabase.

## 1. Create the tables and security rules

1. Open the Supabase project.
2. Open **SQL Editor** and create a new query.
3. Copy the complete contents of
   `supabase/migrations/202608260001_live_classroom.sql` into the editor.
4. Select **Run** once.

5. Create another query, copy the complete contents of
   `supabase/migrations/202609040001_bingo_card_allocator.sql`, and select
   **Run** once. This creates only an anonymous counter used to distribute the
   prepared bingo cards in order.

6. Run the remaining migrations in filename order:
   - `supabase/migrations/202609040002_add_outcome_bias_activity.sql`
   - `supabase/migrations/202609040003_private_completion_counts.sql`
   - `supabase/migrations/202609040004_add_bingo_completion_count.sql`

The completion migrations store only anonymous, run-specific completion
markers for Day 1 Activities 1 and 5 and Day 2 Activity 1. They do not store
cards, marked squares, activity content or scores.

The migration enables Row Level Security, removes access for the public
database roles, creates server-only functions for joining and submitting, and
schedules daily deletion of classroom data older than 30 days.

## 2. Configure the instructor magic-link destination

Open **Authentication → URL Configuration** and set:

- Site URL: `https://oaadm.vercel.app`
- Redirect URL: `https://oaadm.vercel.app/**`
- Development redirect: `http://localhost:3000/**`

The default Supabase magic-link template can remain unchanged. No custom SMTP
is needed for the initial test, provided the instructor email is a member of
the Supabase organization's team. Custom SMTP is recommended before live use
for more dependable delivery.

## 3. Confirm the Vercel variables

The Vercel project needs these variables for Production, Preview and
Development:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `INSTRUCTOR_EMAILS`
- `SESSION_SIGNING_SECRET`

Never prefix the secret key with `NEXT_PUBLIC_`, commit it to GitHub, or put it
in client-side code. Redeploy Vercel after adding or changing variables.

## 4. Start a classroom session

1. Open `/instructor` on the deployed website.
2. Request the secure email link and open it in the browser you want to use for classroom control.
3. Create a classroom session.
4. Open a specific live activity immediately before the class answers it.
5. Use **Open presentation view** to show the automatically updating results.
6. Close the activity to freeze its classroom responses, then enable review mode when students should be able to revisit it.

The instructor page and presentation views update automatically every two
seconds. Students do not see classroom results while an activity is live.
