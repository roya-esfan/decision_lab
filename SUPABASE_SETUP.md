# Supabase setup

The Decision Lab uses Supabase only for anonymous classroom sessions and the
instructor's email sign-in. Assignment 3 and REI-10 remain on the student's
device and are never sent to Supabase.

## 1. Create the tables and security rules

1. Open the Supabase project.
2. Open **SQL Editor** and create a new query.
3. Copy the complete contents of
   `supabase/migrations/202608260001_live_classroom.sql` into the editor.
4. Select **Run** once.

The migration enables Row Level Security, removes access for the public
database roles, creates server-only functions for joining and submitting, and
schedules daily deletion of classroom data older than 30 days.

## 2. Make the instructor email contain a numeric code

1. Open **Authentication → Email Templates → Magic Link**.
2. Replace the template body with a short message containing `{{ .Token }}`.

For example:

```html
<h2>Your Decision Lab sign-in code</h2>
<p>Enter this code on the instructor page:</p>
<p><strong>{{ .Token }}</strong></p>
```

Save the template. Supabase sends a numeric code instead of requiring the
instructor to follow a magic link.

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
2. Request the instructor email code and sign in.
3. Select **Start classroom session**.
4. Show the generated join code to the class.
5. Use the private preview while students answer.
6. Select **Reveal results** when the projector should show the distribution.

The projector links update automatically every two seconds. Regular student
result pages check once and provide a manual refresh button while results are
hidden.
