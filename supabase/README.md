# Supabase setup for Shalom PG

The live project is **PG Manager** (`kosawasseapbgulejwai`). It is already set up; this file is for
rebuilding it from scratch or understanding what's there.

## Rebuild from scratch

1. New Supabase project → **SQL Editor** → paste all of [`schema.sql`](schema.sql) → **Run**.
2. Put the project URL and publishable key in `.env.production` (and `.env.local` for development).
3. Add owner logins under **Authentication → Users → Add user** (tick **Auto Confirm User**).
4. Turn off **Allow new users to sign up** under **Authentication → Sign In / Providers**.

## What's protected

- Each owner can only read and change their own houses, residents, payments and reminders (row-level security).
- Photos and ID proofs are in a **private** storage bucket, in a folder per owner. The app shows them
  through links that expire after a few hours.
- Nothing in the database can be read or called without signing in.

## Later: automatic reminders

`functions/send-reminders` can send reminders by itself every morning (email via Resend, WhatsApp via
the WhatsApp Cloud API or a provider like Interakt/AiSensy). That needs a sending domain and API keys,
so it's not switched on. Until then, owners send reminders in one tap from the app.
